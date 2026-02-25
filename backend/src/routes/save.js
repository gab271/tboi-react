/**
 * Save File Analysis Routes V3
 * POST /api/save/analyze - Upload and parse Isaac save file
 * 
 * Features:
 * - SHA-256 hash verification (client vs server)
 * - Structured logging with requestId
 * - Anti-cache headers
 * - Never returns demo/fake data
 */

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
// Using Parser V3 with correct chunk-based parsing (based on Zamiell's reference implementation)
const { parseSaveFile, detectSlot, validateSaveFile } = require('../lib/saveParserV3');
const { incrementAnalyzeCount } = require('./stats');

const router = express.Router();

// SHA-256 hash utility
function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Generate unique request ID
function genRequestId() {
    return crypto.randomUUID().substring(0, 8);
}

// Structured logger
function log(requestId, level, msg, data = {}) {
    const entry = {
        ts: new Date().toISOString(),
        reqId: requestId,
        level,
        msg,
        ...data
    };
    if (level === 'error') {
        console.error(JSON.stringify(entry));
    } else {
        console.log(JSON.stringify(entry));
    }
}

// Configure multer for memory storage (we parse directly from buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024, // 1MB max (Isaac saves are ~16-32KB)
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Accept .dat files or any octet-stream
        const validNames = ['persistentgamedata', 'rep_'];
        const hasValidName = validNames.some(n => file.originalname.toLowerCase().includes(n));
        
        if (hasValidName || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new Error('INVALID_FILE_TYPE'), false);
        }
    }
});

/**
 * POST /api/save/analyze
 * Uploads and parses an Isaac Repentance save file
 * 
 * Request: 
 *   - multipart/form-data with 'saveFile' field
 *   - Optional header: x-file-sha256 (client-computed hash for verification)
 * 
 * Response: JSON with canonical save data or error
 */
router.post('/analyze', upload.single('saveFile'), async (req, res) => {
    const requestId = genRequestId();
    
    // Anti-cache headers - CRITICAL
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Request-Id': requestId
    });

    const startTime = Date.now();
    
    log(requestId, 'info', 'ANALYZE_START', {
        hasFile: !!req.file,
        filename: req.file?.originalname,
        fileSize: req.file?.size,
        clientHash: req.headers['x-file-sha256']?.substring(0, 16),
        ip: req.ip
    });

    try {
        // Validate file presence
        if (!req.file) {
            log(requestId, 'warn', 'NO_FILE');
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: 'NO_FILE',
                error_message: 'No save file was uploaded. Please select a .dat file.'
            });
        }

        const { buffer, originalname, size } = req.file;
        
        // Validate file size
        if (size === 0) {
            log(requestId, 'warn', 'EMPTY_FILE');
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: 'EMPTY_FILE',
                error_message: 'The uploaded file is empty.'
            });
        }

        // Calculate server-side SHA-256
        const serverHash = sha256(buffer);
        const clientHash = req.headers['x-file-sha256'];
        const slot = detectSlot(originalname);
        
        // Log file details for debugging
        log(requestId, 'info', 'FILE_RECEIVED', {
            filename: originalname,
            size,
            serverHash: serverHash.substring(0, 16),
            clientHash: clientHash?.substring(0, 16),
            first16Hex: buffer.slice(0, 16).toString('hex'),
            first16Ascii: buffer.slice(0, 16).toString('ascii').replace(/[^\x20-\x7E]/g, '.'),
            slot
        });

        // Verify hash if client provided one
        if (clientHash) {
            const serverShort = serverHash.substring(0, 16);
            const clientShort = clientHash.substring(0, 16);
            
            if (serverShort !== clientShort) {
                log(requestId, 'error', 'HASH_MISMATCH', {
                    server: serverShort,
                    client: clientShort
                });
                return res.status(400).json({
                    ok: false,
                    source: 'error',
                    error_code: 'HASH_MISMATCH',
                    error_message: 'File hash mismatch - the upload may have been corrupted. Please try again.',
                    details: {
                        serverHash: serverShort,
                        clientHash: clientShort
                    }
                });
            }
            log(requestId, 'info', 'HASH_VERIFIED', { hash: serverShort });
        }

        // Validate it's an Isaac save
        const validation = validateSaveFile(buffer);
        if (!validation.valid) {
            log(requestId, 'warn', 'VALIDATION_FAIL', validation);
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: validation.error,
                error_message: validation.message || 'Invalid save file format'
            });
        }

        // Parse the save file
        const result = parseSaveFile(buffer, { 
            filename: originalname,
            clientHash: clientHash,
            requestId
        });
        
        const parseTime = Date.now() - startTime;
        
        log(requestId, 'info', 'PARSE_COMPLETE', {
            ok: result.ok,
            source: result.source,
            parseTimeMs: parseTime,
            deadGodPercent: result.progress?.deadGodPercent,
            achievementsCount: result.achievements?.unlocked,
            itemsCount: result.items?.collected
        });

        // Return appropriate status code
        if (result.ok) {
            incrementAnalyzeCount();
            return res.status(200).json(result);
        } else {
            return res.status(422).json(result);
        }

    } catch (error) {
        log(requestId, 'error', 'CRITICAL_ERROR', {
            error: error.message,
            stack: error.stack
        });
        
        // IMPORTANT: Never return demo data on error
        return res.status(500).json({
            ok: false,
            source: 'error',
            error_code: 'INTERNAL_ERROR',
            error_message: 'An unexpected error occurred while parsing the save file.'
        });
    }
});

/**
 * GET /api/save/demo
 * Returns demo/example data - CLEARLY MARKED as demo
 * Only use this for UI preview, never for real analysis
 * NOTE: Updated to V2 response structure
 */
router.get('/demo', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600'); // Demo can be cached
    
    return res.json({
        ok: true,
        source: 'demo', // CRITICAL: Always marked as demo
        error_code: null,
        error_message: null,
        metadata: {
            fileHash: 'demo0000',
            fileSize: 0,
            slot: 1,
            parsedAt: new Date().toISOString(),
            parserVersion: '2.0.0-demo'
        },
        secrets: {
            count: 425,
            total: 637,
            unlockedIds: []
        },
        items: {
            count: 489,
            total: 733,
            unlockedIds: []
        },
        trinkets: {
            count: 89,
            total: 189,
            unlockedIds: []
        },
        endings: {
            count: 14,
            total: 17,
            unlockedIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        },
        characters: {
            // Simplified demo characters
            'Isaac': { completedMarks: 24, percentage: 100, isTainted: false },
            'Magdalene': { completedMarks: 24, percentage: 100, isTainted: false },
            'Cain': { completedMarks: 24, percentage: 100, isTainted: false },
            'Judas': { completedMarks: 24, percentage: 100, isTainted: false },
            'Tainted Lazarus': { completedMarks: 5, percentage: 21, isTainted: true }
        },
        totalMarks: 287,
        totalMarksExpected: 816,
        sanityChecks: {
            invariantsPassed: true,
            warnings: [],
            errors: []
        },
        metrics: {
            deadGodPercentage: 67,
            achievementPercentage: 67,
            marksPercentage: 35,
            itemsPercentage: 67,
            topPercentile: 23,
            estimatedHoursRemaining: 23,
            taintedCompletion: 41
        },
        missing: {
            secrets: 212,
            items: 244,
            marks: 529
        },
        nextSteps: [{
            characterName: 'Tainted Lazarus',
            description: 'Completar Mother con Tainted Lazarus',
            missingMarks: ['Mother', 'Beast', 'Boss Rush', 'Hush', 'Delirium']
        }],
        isDemo: true // Extra flag for safety
    });
});

// Error handler for multer errors
router.use((error, req, res, next) => {
    console.error('[SAVE_ANALYZE] Multer/Route error', {
        error: error.message,
        code: error.code
    });
    
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            ok: false,
            source: 'error',
            error_code: 'FILE_TOO_LARGE',
            error_message: 'File is too large. Isaac save files are typically under 50KB.',
            parsed: null,
            metrics: null
        });
    }
    
    if (error.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
            ok: false,
            source: 'error',
            error_code: 'INVALID_FILE_TYPE',
            error_message: 'Please upload a valid Isaac save file (persistentgamedata.dat)',
            parsed: null,
            metrics: null
        });
    }
    
    return res.status(500).json({
        ok: false,
        source: 'error',
        error_code: 'UPLOAD_ERROR',
        error_message: 'Failed to process the uploaded file.',
        parsed: null,
        metrics: null
    });
});

module.exports = router;
