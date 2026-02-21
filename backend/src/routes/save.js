/**
 * Save File Analysis Routes
 * POST /api/save/analyze - Upload and parse Isaac save file
 */

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { parseSaveFile, detectSlot, validateSaveFile } = require('../lib/saveParser');
const { incrementAnalyzeCount } = require('./stats');

const router = express.Router();

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
 * Request: multipart/form-data with 'saveFile' field
 * Response: JSON with parsed data or error
 */
router.post('/analyze', upload.single('saveFile'), async (req, res) => {
    // Anti-cache headers - CRITICAL
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });

    const startTime = Date.now();
    
    // Log request details
    console.log('[SAVE_ANALYZE] Request received', {
        timestamp: new Date().toISOString(),
        hasFile: !!req.file,
        filename: req.file?.originalname,
        fileSize: req.file?.size,
        mimetype: req.file?.mimetype,
        ip: req.ip
    });

    try {
        // Validate file presence
        if (!req.file) {
            console.log('[SAVE_ANALYZE] ERROR: No file uploaded');
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: 'NO_FILE',
                error_message: 'No save file was uploaded. Please select a .dat file.',
                parsed: null,
                metrics: null
            });
        }

        const { buffer, originalname, size } = req.file;
        
        // Validate file size
        if (size === 0) {
            console.log('[SAVE_ANALYZE] ERROR: Empty file');
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: 'EMPTY_FILE',
                error_message: 'The uploaded file is empty.',
                parsed: null,
                metrics: null
            });
        }

        // Calculate hash for debugging/logging
        const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
        const slot = detectSlot(originalname);
        
        console.log('[SAVE_ANALYZE] Processing file', {
            filename: originalname,
            size,
            hash: fileHash.substring(0, 8),
            slot,
            bufferLength: buffer.length
        });

        // Validate it's an Isaac save
        const validation = validateSaveFile(buffer);
        if (!validation.valid) {
            console.log('[SAVE_ANALYZE] ERROR: Invalid save file', validation);
            return res.status(400).json({
                ok: false,
                source: 'error',
                error_code: validation.error,
                error_message: validation.message,
                parsed: null,
                metrics: null
            });
        }

        // Parse the save file
        const result = parseSaveFile(buffer);
        
        const parseTime = Date.now() - startTime;
        
        // Add metadata to result
        if (result.ok) {
            result.parsed.slot = slot;
            result.parsed.filename = originalname;
            result.parsed.uploadedAt = new Date().toISOString();
            result.parseTimeMs = parseTime;
        }
        
        console.log('[SAVE_ANALYZE] Parse complete', {
            ok: result.ok,
            source: result.source,
            parseTimeMs: parseTime,
            deadGodPercentage: result.metrics?.deadGodPercentage,
            completionMarks: result.parsed?.completionMarks,
            fileHash: fileHash.substring(0, 8)
        });

        // Return appropriate status code
        if (result.ok) {
            // Increment daily counter on successful analysis
            incrementAnalyzeCount();
            return res.status(200).json(result);
        } else {
            return res.status(422).json(result);
        }

    } catch (error) {
        console.error('[SAVE_ANALYZE] CRITICAL ERROR', {
            error: error.message,
            stack: error.stack
        });
        
        // IMPORTANT: Never return demo data on error - always return error response
        return res.status(500).json({
            ok: false,
            source: 'error',
            error_code: 'INTERNAL_ERROR',
            error_message: 'An unexpected error occurred while parsing the save file.',
            parsed: null,
            metrics: null
        });
    }
});

/**
 * GET /api/save/demo
 * Returns demo/example data - CLEARLY MARKED as demo
 * Only use this for UI preview, never for real analysis
 */
router.get('/demo', (req, res) => {
    res.set('Cache-Control', 'public, max-age=3600'); // Demo can be cached
    
    return res.json({
        ok: true,
        source: 'demo', // CRITICAL: Always marked as demo
        error_code: null,
        error_message: null,
        parsed: {
            fileHash: 'demo0000',
            fileSize: 0,
            version: 'demo',
            slot: 1,
            achievementsUnlocked: 425,
            totalAchievements: 637,
            completionMarks: 287,
            totalMarks: 408,
            itemsCollected: 489,
            totalItems: 733,
            completedCharacters: 21,
            totalCharacters: 34,
            vanillaCompleted: 14,
            taintedCompleted: 7,
            blockerCharacter: 'Tainted Lazarus',
            blockerMarks: 5,
            nextObjective: 'Completar Mother con Tainted Lazarus'
        },
        metrics: {
            deadGodPercentage: 67,
            achievementPercentage: 67,
            marksPercentage: 70,
            itemsPercentage: 67,
            topPercentile: 23,
            estimatedHoursRemaining: 23,
            taintedCompletion: 41
        },
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
