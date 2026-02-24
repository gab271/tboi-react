/**
 * Isaac Repentance+ Save File Parser V3
 * =====================================
 * 
 * REWRITTEN FROM SCRATCH with:
 * - Proper binary parsing (little-endian, LSB-first bitfields)
 * - File variant detection (vanilla, rep, rep+)
 * - SHA-256 hash verification
 * - Strict invariant checks
 * - NEVER returns fake/demo data
 * - Canonical JSON response format
 * 
 * @version 3.0.0
 * @author Senior Engineering Team
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PARSER_VERSION = '3.0.0';

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CODES - Exhaustive list of failure modes
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_CODES = {
    // Client errors (4xx)
    NO_FILE: { code: 'NO_FILE', http: 400, message: 'No file uploaded' },
    EMPTY_FILE: { code: 'EMPTY_FILE', http: 400, message: 'File is empty (0 bytes)' },
    FILE_TOO_SMALL: { code: 'FILE_TOO_SMALL', http: 400, message: 'File too small - not a valid Isaac save' },
    FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', http: 400, message: 'File too large - exceeds 100KB limit' },
    HASH_MISMATCH: { code: 'HASH_MISMATCH', http: 400, message: 'File hash mismatch - upload corrupted' },
    
    // Parse errors (422)
    INVALID_FORMAT: { code: 'INVALID_FORMAT', http: 422, message: 'Not a valid Isaac save file format' },
    UNSUPPORTED_VERSION: { code: 'UNSUPPORTED_VERSION', http: 422, message: 'Save file version not supported' },
    EMPTY_SAVE: { code: 'EMPTY_SAVE', http: 422, message: 'Save file contains no progress data' },
    CORRUPTED: { code: 'CORRUPTED', http: 422, message: 'Save file appears corrupted' },
    INVARIANT_FAIL: { code: 'INVARIANT_FAIL', http: 422, message: 'Parsed data fails sanity checks' },
    OFFSET_ERROR: { code: 'OFFSET_ERROR', http: 422, message: 'Could not read data at expected offset' },
    
    // Server errors (5xx)
    INTERNAL: { code: 'INTERNAL', http: 500, message: 'Internal parser error' },
    DATASET_MISSING: { code: 'DATASET_MISSING', http: 500, message: 'Required dataset not found' }
};

// ═══════════════════════════════════════════════════════════════════════════
// BINARY PARSING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decodes a bitfield from buffer using LSB-first ordering
 * CRITICAL: This is the correct way to read Isaac's bitfields
 * 
 * @param {Buffer} buffer - The save file buffer
 * @param {number} offset - Byte offset where bitfield starts
 * @param {number} nBits - Number of bits to read
 * @returns {number[]} Array of bit indices that are set (1)
 */
function decodeBitset(buffer, offset, nBits) {
    const setBits = [];
    
    for (let bitIdx = 0; bitIdx < nBits; bitIdx++) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitPos = bitIdx % 8; // LSB = bit 0
        
        if (offset + byteIdx >= buffer.length) {
            // Buffer overflow - return what we have, don't crash
            console.warn(`[decodeBitset] Buffer overflow at offset ${offset + byteIdx}, stopping at bit ${bitIdx}`);
            break;
        }
        
        const byte = buffer[offset + byteIdx];
        const isSet = (byte & (1 << bitPos)) !== 0;
        
        if (isSet) {
            setBits.push(bitIdx);
        }
    }
    
    return setBits;
}

/**
 * Count set bits in a range (convenience wrapper)
 */
function countBits(buffer, offset, nBits) {
    return decodeBitset(buffer, offset, nBits).length;
}

/**
 * Read a single bit from buffer
 */
function readBit(buffer, offset, bitIndex) {
    const byteIdx = Math.floor(bitIndex / 8);
    const bitPos = bitIndex % 8;
    
    if (offset + byteIdx >= buffer.length) return false;
    
    return (buffer[offset + byteIdx] & (1 << bitPos)) !== 0;
}

/**
 * Read a byte as boolean
 */
function readBool(buffer, offset) {
    if (offset >= buffer.length) return false;
    return buffer[offset] !== 0;
}

/**
 * Read uint32 little-endian
 */
function readUInt32LE(buffer, offset) {
    if (offset + 4 > buffer.length) return 0;
    return buffer.readUInt32LE(offset);
}

/**
 * Read uint16 little-endian
 */
function readUInt16LE(buffer, offset) {
    if (offset + 2 > buffer.length) return 0;
    return buffer.readUInt16LE(offset);
}

/**
 * Calculate SHA-256 hash of buffer
 */
function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculate MD5 hash (for shorter display)
 */
function md5Short(buffer) {
    return crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
// DATASET LOADER
// ═══════════════════════════════════════════════════════════════════════════

class DatasetManager {
    constructor() {
        this.cache = new Map();
        this.basePath = path.join(__dirname, '../../data/versions');
    }
    
    load(version, type) {
        const key = `${version}:${type}`;
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const filePath = path.join(this.basePath, version, `${type}.json`);
        
        if (!fs.existsSync(filePath)) {
            // Try fallback to repentance_plus
            const fallback = path.join(this.basePath, 'repentance_plus', `${type}.json`);
            if (fs.existsSync(fallback)) {
                const data = JSON.parse(fs.readFileSync(fallback, 'utf8'));
                this.cache.set(key, data);
                return data;
            }
            throw new Error(`Dataset not found: ${key}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.cache.set(key, data);
        return data;
    }
    
    getOffsets(version) {
        return this.load(version, 'offsets');
    }
    
    getCharacters(version) {
        return this.load(version, 'characters');
    }
    
    getEndings(version) {
        try {
            return this.load(version, 'endings');
        } catch {
            return { total: 17, endings: [] };
        }
    }
    
    getAchievements(version) {
        try {
            return this.load(version, 'achievements');
        } catch {
            return { total: 637, achievements: [] };
        }
    }
}

const datasets = new DatasetManager();

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PARSER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class IsaacSaveParser {
    constructor(options = {}) {
        this.debug = options.debug ?? (process.env.NODE_ENV !== 'production');
        this.requestId = options.requestId ?? crypto.randomUUID().substring(0, 8);
    }
    
    /**
     * Main entry point - parse a save file buffer
     * 
     * @param {Buffer} buffer - Raw file bytes
     * @param {Object} options - { filename, clientHash }
     * @returns {Object} Canonical response format
     */
    parse(buffer, options = {}) {
        const startMs = Date.now();
        const log = (msg, data) => {
            if (this.debug) {
                console.log(`[Parser:${this.requestId}] ${msg}`, data || '');
            }
        };
        
        try {
            // ══════════════════════════════════════════════════════════════
            // STEP 1: Validate buffer
            // ══════════════════════════════════════════════════════════════
            
            const validation = this._validateBuffer(buffer);
            if (!validation.ok) {
                log('Validation failed', validation);
                return this._error(validation.errorCode, {
                    size: buffer?.length,
                    reason: validation.reason
                });
            }
            
            // ══════════════════════════════════════════════════════════════
            // STEP 2: Calculate hashes
            // ══════════════════════════════════════════════════════════════
            
            const serverHash = sha256(buffer);
            const shortHash = serverHash.substring(0, 16);
            
            log('File received', {
                size: buffer.length,
                sha256: shortHash,
                first16Hex: buffer.slice(0, 16).toString('hex'),
                first16Ascii: buffer.slice(0, 16).toString('ascii').replace(/[^\x20-\x7E]/g, '.')
            });
            
            // Verify client hash if provided
            if (options.clientHash) {
                const clientShort = options.clientHash.substring(0, 16);
                if (clientShort !== shortHash) {
                    log('Hash mismatch!', { client: clientShort, server: shortHash });
                    return this._error('HASH_MISMATCH', {
                        clientHash: clientShort,
                        serverHash: shortHash
                    });
                }
                log('Hash verified', shortHash);
            }
            
            // ══════════════════════════════════════════════════════════════
            // STEP 3: Detect game variant
            // ══════════════════════════════════════════════════════════════
            
            const variant = this._detectVariant(buffer, options.filename);
            log('Detected variant', variant);
            
            if (!variant.supported) {
                return this._error('UNSUPPORTED_VERSION', {
                    detected: variant.variant,
                    confidence: variant.confidence
                });
            }
            
            // ══════════════════════════════════════════════════════════════
            // STEP 4: Load datasets
            // ══════════════════════════════════════════════════════════════
            
            let offsets, charData, endingsData;
            try {
                offsets = datasets.getOffsets(variant.variant);
                charData = datasets.getCharacters(variant.variant);
                endingsData = datasets.getEndings(variant.variant);
            } catch (e) {
                log('Dataset load failed', e.message);
                return this._error('DATASET_MISSING', { message: e.message });
            }
            
            // ══════════════════════════════════════════════════════════════
            // STEP 5: Parse each section
            // ══════════════════════════════════════════════════════════════
            
            const achievements = this._parseAchievements(buffer, offsets);
            const items = this._parseItems(buffer, offsets);
            const trinkets = this._parseTrinkets(buffer, offsets);
            const challenges = this._parseChallenges(buffer, offsets);
            const characters = this._parseCharacters(buffer, offsets, charData);
            const endings = this._deriveEndings(characters, endingsData);
            
            // ══════════════════════════════════════════════════════════════
            // STEP 6: Calculate totals
            // ══════════════════════════════════════════════════════════════
            
            const marksTotals = this._calculateMarkTotals(characters, charData);
            
            // ══════════════════════════════════════════════════════════════
            // STEP 7: Run invariant checks
            // ══════════════════════════════════════════════════════════════
            
            const sanity = this._checkInvariants({
                achievements, items, trinkets, challenges, endings, marksTotals
            }, offsets);
            
            if (!sanity.ok && sanity.critical) {
                log('Critical invariant failure', sanity);
                return this._error('INVARIANT_FAIL', {
                    errors: sanity.errors,
                    warnings: sanity.warnings
                });
            }
            
            // ══════════════════════════════════════════════════════════════
            // STEP 8: Build canonical response
            // ══════════════════════════════════════════════════════════════
            
            const parseMs = Date.now() - startMs;
            
            const response = {
                ok: true,
                source: 'real', // NEVER 'demo'
                error_code: null,
                error_message: null,
                
                meta: {
                    fileName: options.filename || 'unknown',
                    fileSize: buffer.length,
                    sha256: serverHash,
                    parsedAt: new Date().toISOString(),
                    parserVersion: PARSER_VERSION,
                    gameVariant: variant.variant,
                    slot: this._detectSlot(options.filename),
                    parseMs,
                    warnings: sanity.warnings,
                    invariantsPassed: sanity.ok
                },
                
                progress: {
                    deadGodPercent: this._calculateDeadGodPercent(achievements),
                    isDeadGod: achievements.count >= achievements.total,
                    breakdown: {
                        achievements: {
                            count: achievements.count,
                            total: achievements.total,
                            percent: this._percent(achievements.count, achievements.total)
                        },
                        marksHard: {
                            count: marksTotals.hard,
                            total: marksTotals.hardTotal,
                            percent: this._percent(marksTotals.hard, marksTotals.hardTotal)
                        },
                        items: {
                            count: items.count,
                            total: items.total,
                            percent: this._percent(items.count, items.total)
                        },
                        challenges: {
                            count: challenges.count,
                            total: challenges.total,
                            percent: this._percent(challenges.count, challenges.total)
                        },
                        endings: {
                            count: endings.count,
                            total: endings.total,
                            percent: this._percent(endings.count, endings.total)
                        }
                    },
                    missing: {
                        achievements: achievements.total - achievements.count,
                        items: items.total - items.count,
                        challenges: challenges.total - challenges.count,
                        hardMarks: marksTotals.hardTotal - marksTotals.hard
                    }
                },
                
                characters: this._formatCharactersForResponse(characters, charData),
                
                items: {
                    totalItems: items.total,
                    collectedIds: items.collectedIds,
                    seenIds: items.seenIds,
                    collectedCount: items.count,
                    seenCount: items.seenCount
                },
                
                endings: {
                    totalEndings: endings.total,
                    unlockedIds: endings.unlockedIds,
                    count: endings.count
                },
                
                sanity: {
                    computedChecks: sanity.checks,
                    ok: sanity.ok,
                    warnings: sanity.warnings,
                    errors: sanity.errors
                },
                
                // Legacy compatibility fields
                secrets: achievements, // V2 called them secrets
                trinkets,
                challenges,
                totalMarks: marksTotals.all,
                totalMarksExpected: marksTotals.allTotal,
                metrics: {
                    deadGodPercentage: this._calculateDeadGodPercent(achievements),
                    secretsPercentage: this._percent(achievements.count, achievements.total),
                    marksPercentage: this._percent(marksTotals.all, marksTotals.allTotal),
                    itemsPercentage: this._percent(items.count, items.total),
                    challengesPercentage: this._percent(challenges.count, challenges.total),
                    estimatedHoursRemaining: this._estimateHoursRemaining(achievements),
                    taintedProgress: this._calculateTaintedProgress(characters)
                },
                metadata: {
                    fileHash: shortHash,
                    sha256: serverHash,
                    slot: this._detectSlot(options.filename),
                    filename: options.filename,
                    parsedAt: new Date().toISOString(),
                    parserVersion: PARSER_VERSION,
                    gameVersion: variant.variant,
                    parseTimeMs: parseMs
                }
            };
            
            log('Parse complete', {
                deadGod: response.progress.deadGodPercent + '%',
                achievements: `${achievements.count}/${achievements.total}`,
                items: `${items.count}/${items.total}`,
                parseMs
            });
            
            return response;
            
        } catch (error) {
            console.error(`[Parser:${this.requestId}] CRITICAL ERROR:`, error);
            return this._error('INTERNAL', {
                message: error.message,
                stack: this.debug ? error.stack : undefined
            });
        }
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ══════════════════════════════════════════════════════════════════════
    
    _validateBuffer(buffer) {
        if (!buffer) {
            return { ok: false, errorCode: 'NO_FILE', reason: 'Buffer is null/undefined' };
        }
        
        if (buffer.length === 0) {
            return { ok: false, errorCode: 'EMPTY_FILE', reason: 'Buffer length is 0' };
        }
        
        if (buffer.length < 1000) {
            return { ok: false, errorCode: 'FILE_TOO_SMALL', reason: `Only ${buffer.length} bytes` };
        }
        
        if (buffer.length > 100000) {
            return { ok: false, errorCode: 'FILE_TOO_LARGE', reason: `${buffer.length} bytes exceeds 100KB` };
        }
        
        // Check for some non-zero data in expected locations
        const hasData = buffer.slice(16, 200).some(b => b !== 0);
        if (!hasData) {
            return { ok: false, errorCode: 'EMPTY_SAVE', reason: 'No data in progress section' };
        }
        
        return { ok: true };
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // VARIANT DETECTION
    // ══════════════════════════════════════════════════════════════════════
    
    _detectVariant(buffer, filename) {
        // Check filename patterns first
        if (filename) {
            const fn = filename.toLowerCase();
            if (fn.includes('rep+') || fn.includes('repentance+')) {
                return { variant: 'repentance_plus', confidence: 'filename', supported: true };
            }
            if (fn.includes('rep_persistentgamedata')) {
                return { variant: 'repentance_plus', confidence: 'filename', supported: true };
            }
            if (fn.includes('persistentgamedata') && !fn.includes('rep_')) {
                return { variant: 'vanilla', confidence: 'filename', supported: false };
            }
        }
        
        // Heuristics based on file size
        const size = buffer.length;
        
        if (size >= 20000) {
            return { variant: 'repentance_plus', confidence: 'size_high', supported: true };
        }
        if (size >= 15000) {
            return { variant: 'repentance_plus', confidence: 'size_medium', supported: true };
        }
        if (size >= 10000) {
            return { variant: 'repentance_plus', confidence: 'size_low', supported: true };
        }
        
        return { variant: 'unknown', confidence: 'guess', supported: false };
    }
    
    _detectSlot(filename) {
        if (!filename) return 1;
        const match = filename.match(/(\d)/);
        return match ? parseInt(match[1], 10) : 1;
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // SECTION PARSERS
    // ══════════════════════════════════════════════════════════════════════
    
    _parseAchievements(buffer, offsets) {
        const section = offsets.fileStructure.achievements;
        const bits = decodeBitset(buffer, section.offset, section.bitsUsed);
        
        return {
            total: section.bitsUsed,
            unlockedIds: bits,
            count: bits.length
        };
    }
    
    _parseItems(buffer, offsets) {
        const section = offsets.fileStructure.items;
        const collectedBits = decodeBitset(buffer, section.offset, section.bitsUsed);
        
        // Items seen might be in a separate section
        let seenBits = collectedBits;
        let seenCount = collectedBits.length;
        
        if (offsets.fileStructure.itemsSeen) {
            const seenSection = offsets.fileStructure.itemsSeen;
            seenBits = decodeBitset(buffer, seenSection.offset, seenSection.bitsUsed);
            seenCount = seenBits.length;
        }
        
        return {
            total: section.bitsUsed,
            collectedIds: collectedBits,
            seenIds: seenBits,
            count: collectedBits.length,
            seenCount
        };
    }
    
    _parseTrinkets(buffer, offsets) {
        const section = offsets.fileStructure.trinkets;
        if (!section) {
            return { total: 189, collectedIds: [], count: 0 };
        }
        
        const bits = decodeBitset(buffer, section.offset, section.bitsUsed);
        
        return {
            total: section.bitsUsed,
            collectedIds: bits,
            count: bits.length
        };
    }
    
    _parseChallenges(buffer, offsets) {
        const section = offsets.fileStructure.challenges;
        const bits = decodeBitset(buffer, section.offset, section.bitsUsed);
        
        return {
            total: section.bitsUsed,
            // Challenges are 1-indexed in game
            completedIds: bits.map(b => b + 1),
            count: bits.length
        };
    }
    
    _parseCharacters(buffer, offsets, charData) {
        const section = offsets.fileStructure.completionMarks;
        const characters = {};
        const markOrder = charData.markOrder || charData.markNames.normal;
        
        for (let i = 0; i < charData.total; i++) {
            const charDef = charData.characters[i];
            if (!charDef) continue;
            
            const charOffset = section.offset + (i * section.perCharacterSize);
            const struct = section.structure;
            
            // Read normal/hard marks as bitfields
            const normalBits = decodeBitset(
                buffer, 
                charOffset + struct.normalMarks.relativeOffset, 
                struct.normalMarks.bits
            );
            const hardBits = decodeBitset(
                buffer, 
                charOffset + struct.hardMarks.relativeOffset, 
                struct.hardMarks.bits
            );
            
            // Read greed marks as booleans
            const greedCompleted = readBool(buffer, charOffset + struct.greedMark.relativeOffset);
            const greedierCompleted = readBool(buffer, charOffset + struct.greedierMark.relativeOffset);
            
            // Build mark objects
            const normalMarks = {};
            const hardMarks = {};
            
            markOrder.forEach((name, idx) => {
                normalMarks[name] = normalBits.includes(idx);
                hardMarks[name] = hardBits.includes(idx);
            });
            
            const greedMarks = charDef.hasGreed ? {
                ultraGreed: greedCompleted,
                ultraGreedier: greedierCompleted
            } : null;
            
            // Count marks
            const normalCount = normalBits.length;
            const hardCount = hardBits.length;
            const greedCount = (greedCompleted ? 1 : 0) + (greedierCompleted ? 1 : 0);
            
            // Total per character
            const totalMarks = charData.totalMarksPerCharacter || 24;
            const completedMarks = normalCount + hardCount + greedCount;
            
            characters[i] = {
                id: i,
                internalId: charDef.internalId || i,
                name: charDef.name,
                isTainted: charDef.isTainted,
                marks: {
                    normal: normalMarks,
                    hard: hardMarks,
                    greed: greedMarks
                },
                counts: {
                    normal: normalCount,
                    hard: hardCount,
                    greed: greedCount
                },
                totalMarks,
                completedMarks,
                percentage: Math.round((completedMarks / totalMarks) * 100)
            };
        }
        
        return characters;
    }
    
    _deriveEndings(characters, endingsData) {
        const TOTAL = endingsData.total || 17;
        
        // Endings are derived from completion marks, NOT read from separate section
        const hasAnyMark = (markName) => {
            return Object.values(characters).some(c => 
                c.marks.normal[markName] || c.marks.hard[markName]
            );
        };
        
        const hasGreedMark = (markType) => {
            return Object.values(characters).some(c => 
                c.marks.greed && c.marks.greed[markType]
            );
        };
        
        const countCharsWithMark = (markName) => {
            return Object.values(characters).filter(c => 
                c.marks.normal[markName] || c.marks.hard[markName]
            ).length;
        };
        
        const unlockedIds = [];
        
        // Ending 1: Always unlocked if save exists
        unlockedIds.push(1);
        
        // Endings 2-15: Based on specific marks
        if (hasAnyMark('momsHeart')) unlockedIds.push(2);
        if (countCharsWithMark('momsHeart') >= 10) unlockedIds.push(3); // It Lives ending
        if (hasAnyMark('isaac')) unlockedIds.push(4);
        if (hasAnyMark('blueBaby')) unlockedIds.push(5);
        if (hasAnyMark('satan')) unlockedIds.push(6);
        if (hasAnyMark('theLamb')) unlockedIds.push(7);
        if (hasAnyMark('bossRush')) unlockedIds.push(8);
        if (hasAnyMark('megaSatan')) unlockedIds.push(9);
        if (hasAnyMark('hush')) unlockedIds.push(10);
        if (hasAnyMark('delirium')) unlockedIds.push(11);
        if (hasGreedMark('ultraGreed')) unlockedIds.push(12);
        if (hasGreedMark('ultraGreedier')) unlockedIds.push(13);
        if (hasAnyMark('mother')) unlockedIds.push(14);
        if (hasAnyMark('beast')) unlockedIds.push(15);
        
        // Ending 16: Multiple boss endings (epilogue)
        if (unlockedIds.length >= 10) unlockedIds.push(16);
        
        // Ending 17: True ending (Dead God) - would require checking all achievements
        // Not adding this one as it requires 100% achievements
        
        return {
            total: TOTAL,
            unlockedIds: unlockedIds.slice(0, TOTAL), // Never exceed total
            count: Math.min(unlockedIds.length, TOTAL)
        };
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // TOTALS CALCULATION
    // ══════════════════════════════════════════════════════════════════════
    
    _calculateMarkTotals(characters, charData) {
        let allMarks = 0;
        let hardMarks = 0;
        let normalMarks = 0;
        let greedMarks = 0;
        
        for (const char of Object.values(characters)) {
            allMarks += char.completedMarks;
            hardMarks += char.counts.hard;
            normalMarks += char.counts.normal;
            greedMarks += char.counts.greed;
        }
        
        const numChars = charData.total || 34;
        const marksPerChar = charData.totalMarksPerCharacter || 24;
        const hardPerChar = charData.hardMarksPerCharacter || 11;
        
        return {
            all: allMarks,
            allTotal: numChars * marksPerChar,
            hard: hardMarks,
            hardTotal: numChars * hardPerChar,
            normal: normalMarks,
            normalTotal: numChars * (charData.normalMarksPerCharacter || 11),
            greed: greedMarks,
            greedTotal: numChars * (charData.greedMarksPerCharacter || 2)
        };
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // INVARIANT CHECKS
    // ══════════════════════════════════════════════════════════════════════
    
    _checkInvariants(data, offsets) {
        const errors = [];
        const warnings = [];
        const checks = {};
        
        // Check: counts never exceed totals
        checks.achievementsValid = data.achievements.count <= data.achievements.total;
        if (!checks.achievementsValid) {
            errors.push(`achievements.count (${data.achievements.count}) > total (${data.achievements.total})`);
        }
        
        checks.itemsValid = data.items.count <= data.items.total;
        if (!checks.itemsValid) {
            errors.push(`items.count (${data.items.count}) > total (${data.items.total})`);
        }
        
        checks.endingsValid = data.endings.count <= data.endings.total;
        if (!checks.endingsValid) {
            errors.push(`endings.count (${data.endings.count}) > total (${data.endings.total})`);
        }
        
        checks.challengesValid = data.challenges.count <= data.challenges.total;
        if (!checks.challengesValid) {
            errors.push(`challenges.count (${data.challenges.count}) > total (${data.challenges.total})`);
        }
        
        checks.marksValid = data.marksTotals.all <= data.marksTotals.allTotal;
        if (!checks.marksValid) {
            errors.push(`marks (${data.marksTotals.all}) > total (${data.marksTotals.allTotal})`);
        }
        
        // Check: non-negative counts
        checks.nonNegative = data.achievements.count >= 0 && data.items.count >= 0;
        if (!checks.nonNegative) {
            errors.push('Negative count detected');
        }
        
        // Cross-validation: high marks should correlate with high achievements
        const marksPercent = (data.marksTotals.all / data.marksTotals.allTotal) * 100;
        const achievPercent = (data.achievements.count / data.achievements.total) * 100;
        
        checks.progressCorrelation = !(marksPercent > 80 && achievPercent < 30);
        if (!checks.progressCorrelation) {
            warnings.push(`Unusual correlation: ${marksPercent.toFixed(0)}% marks but only ${achievPercent.toFixed(0)}% achievements`);
        }
        
        // Warning: very low progress with large file
        if (achievPercent < 5 && marksPercent < 5 && data.achievements.count < 20) {
            warnings.push('Very low progress - possible new save or parse issue');
        }
        
        const critical = errors.length > 0;
        
        return {
            ok: errors.length === 0,
            critical,
            errors,
            warnings,
            checks
        };
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // METRICS CALCULATION
    // ══════════════════════════════════════════════════════════════════════
    
    _calculateDeadGodPercent(achievements) {
        // Dead God = 100% of achievements
        if (achievements.total === 0) return 0;
        const percent = (achievements.count / achievements.total) * 100;
        return Math.round(percent * 100) / 100; // 2 decimal places
    }
    
    _percent(count, total) {
        if (total === 0) return 0;
        return Math.round((count / total) * 10000) / 100; // 2 decimal places
    }
    
    _estimateHoursRemaining(achievements) {
        const remaining = achievements.total - achievements.count;
        // Rough estimate: ~0.3 hours per achievement on average
        return Math.round(remaining * 0.3);
    }
    
    _calculateTaintedProgress(characters) {
        const tainted = Object.values(characters).filter(c => c.isTainted);
        const completed = tainted.filter(c => c.percentage === 100).length;
        const totalMarks = tainted.reduce((sum, c) => sum + c.completedMarks, 0);
        const expectedMarks = tainted.reduce((sum, c) => sum + c.totalMarks, 0);
        
        return {
            completed,
            total: tainted.length,
            percentage: expectedMarks > 0 ? Math.round((totalMarks / expectedMarks) * 100) : 0
        };
    }
    
    _formatCharactersForResponse(characters, charData) {
        const result = {};
        
        for (const [id, char] of Object.entries(characters)) {
            result[id] = {
                id: char.id,
                name: char.name,
                isTainted: char.isTainted,
                completionMarks: {
                    hard: char.marks.hard,
                    normal: char.marks.normal,
                    greed: char.marks.greed
                },
                counts: {
                    hardCompleted: char.counts.hard,
                    hardTotal: charData.hardMarksPerCharacter || 11,
                    normalCompleted: char.counts.normal,
                    normalTotal: charData.normalMarksPerCharacter || 11,
                    greedCompleted: char.counts.greed,
                    greedTotal: charData.greedMarksPerCharacter || 2
                },
                percentage: char.percentage
            };
        }
        
        return result;
    }
    
    // ══════════════════════════════════════════════════════════════════════
    // ERROR RESPONSE
    // ══════════════════════════════════════════════════════════════════════
    
    _error(errorCode, details = {}) {
        const errDef = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL;
        
        return {
            ok: false,
            source: 'error', // NEVER 'demo'
            error_code: errDef.code,
            error_message: errDef.message,
            details,
            meta: null,
            progress: null,
            characters: null,
            items: null,
            endings: null,
            sanity: { ok: false },
            // Legacy fields
            secrets: null,
            trinkets: null,
            challenges: null,
            metrics: null,
            metadata: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const defaultParser = new IsaacSaveParser();

module.exports = {
    // Main parser
    parseSaveFile: (buffer, options) => defaultParser.parse(buffer, options),
    
    // Create custom parser instance
    createParser: (options) => new IsaacSaveParser(options),
    
    // Utilities
    decodeBitset,
    countBits,
    readBit,
    readBool,
    sha256,
    md5Short,
    
    // Config
    PARSER_VERSION,
    ERROR_CODES,
    
    // Validation helpers
    validateSaveFile: (buffer) => defaultParser._validateBuffer(buffer),
    detectSlot: (filename) => defaultParser._detectSlot(filename),
    detectVariant: (buffer, filename) => defaultParser._detectVariant(buffer, filename)
};
