/**
 * Isaac Repentance Save File Parser V3
 * =====================================
 * 
 * REWRITTEN based on the reference implementation from Zamiell:
 * https://github.com/Zamiell/isaac-save-viewer
 * 
 * The save file format was reverse-engineered by Blade using Kaitai Struct.
 * 
 * KEY INSIGHTS FROM REFERENCE:
 * - File uses a CHUNK-based format, NOT fixed offsets
 * - Achievements/Collectibles are BYTES, not bits (byte > 0 = unlocked)
 * - All integers are Little-Endian
 * - Header: 16 bytes magic + 4 bytes CRC = 20 bytes
 * - Then 11 sequential chunks
 * 
 * @version 3.0.0
 * @author Rewritten based on Zamiell/Blade's reference implementation
 */

const crypto = require('crypto');

const PARSER_VERSION = '3.0.0';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS - From reference implementation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Magic strings for different game versions
 * Source: https://github.com/Zamiell/isaac-save-viewer/blob/main/src/readFile.ts
 */
const HEADERS = {
    // Persistent save files (the ones we parse)
    REBIRTH: 'ISAACNGSAVE06R',
    AFTERBIRTH: 'ISAACNGSAVE08R',
    AFTERBIRTH_PLUS_AND_REPENTANCE: 'ISAACNGSAVE09R',
    
    // Run files (temporary game state, not what we want)
    REBIRTH_RUN: 'ISAACNG_GSR0018',
    AFTERBIRTH_RUN: 'ISAACNG_GSR0034',
    AFTERBIRTH_PLUS_RUN: 'ISAACNG_GSR0065',
    REPENTANCE_RUN: 'ISAACNG_GSR0142'
};

/**
 * Chunk types in the save file
 * Source: https://github.com/Zamiell/isaac-save-viewer/blob/main/src/enums/ChunkType.ts
 */
const ChunkType = {
    ACHIEVEMENTS: 1,
    COUNTERS: 2,
    LEVEL_COUNTERS: 3,
    COLLECTIBLES: 4,
    MINIBOSSES: 5,
    BOSSES: 6,
    CHALLENGE_COUNTERS: 7,
    CUTSCENE_COUNTERS: 8,
    GAME_SETTINGS: 9,
    SPECIAL_SEED_COUNTERS: 10,
    BESTIARY_COUNTERS: 11
};

// Number of chunks in Repentance saves
const NUM_CHUNKS = 11;

// Header size: 16 bytes magic + 4 bytes CRC
const HEADER_SIZE = 20;

// For distinguishing Afterbirth+ from Repentance (same header)
// Afterbirth+ has 404 achievements (including 0th element)
const NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS = 404;

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_CODES = {
    NO_FILE: { code: 'NO_FILE', message: 'No file provided' },
    EMPTY_FILE: { code: 'EMPTY_FILE', message: 'File is empty' },
    FILE_TOO_SMALL: { code: 'FILE_TOO_SMALL', message: 'File too small to be a valid save' },
    FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', message: 'File exceeds maximum size' },
    INVALID_HEADER: { code: 'INVALID_HEADER', message: 'Not a valid Isaac save file' },
    RUN_FILE: { code: 'RUN_FILE', message: 'This is a run state file, not a persistent save file' },
    WRONG_VERSION: { code: 'WRONG_VERSION', message: 'Save file is from wrong game version' },
    PARSE_ERROR: { code: 'PARSE_ERROR', message: 'Error parsing save file structure' }
};

// ═══════════════════════════════════════════════════════════════════════════
// KAITAI-STREAM-LIKE READER
// Based on: https://github.com/Zamiell/isaac-save-viewer/blob/main/static/lib/KaitaiStream.js
// ═══════════════════════════════════════════════════════════════════════════

class BinaryReader {
    /**
     * Creates a binary reader for Isaac save files
     * @param {Buffer} buffer - The file buffer
     */
    constructor(buffer) {
        this.buffer = buffer;
        this.pos = 0;
        this.size = buffer.length;
    }
    
    /**
     * Check if we've reached end of file
     */
    isEof() {
        return this.pos >= this.size;
    }
    
    /**
     * Seek to a position
     */
    seek(pos) {
        this.pos = Math.max(0, Math.min(pos, this.size));
    }
    
    /**
     * Read bytes as ASCII string
     */
    readBytes(len) {
        if (this.pos + len > this.size) {
            throw new Error(`Buffer overflow: trying to read ${len} bytes at position ${this.pos}, but size is ${this.size}`);
        }
        const bytes = this.buffer.slice(this.pos, this.pos + len);
        this.pos += len;
        return bytes;
    }
    
    /**
     * Read unsigned 8-bit integer (1 byte)
     * Source: KaitaiStream.prototype.readU1
     */
    readU1() {
        if (this.pos + 1 > this.size) {
            throw new Error(`Buffer overflow at position ${this.pos}`);
        }
        const v = this.buffer.readUInt8(this.pos);
        this.pos += 1;
        return v;
    }
    
    /**
     * Read signed 32-bit little-endian integer (4 bytes)
     * Source: KaitaiStream.prototype.readS4le
     */
    readS4le() {
        if (this.pos + 4 > this.size) {
            throw new Error(`Buffer overflow at position ${this.pos}`);
        }
        const v = this.buffer.readInt32LE(this.pos);
        this.pos += 4;
        return v;
    }
    
    /**
     * Read unsigned 32-bit little-endian integer (4 bytes)
     * Source: KaitaiStream.prototype.readU4le
     */
    readU4le() {
        if (this.pos + 4 > this.size) {
            throw new Error(`Buffer overflow at position ${this.pos}`);
        }
        const v = this.buffer.readUInt32LE(this.pos);
        this.pos += 4;
        return v;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHUNK PARSERS
// Based on: https://github.com/Zamiell/isaac-save-viewer/blob/main/static/lib/IsaacSaveFile.js
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse achievements chunk
 * Each achievement is 1 byte: 0 = locked, >0 = unlocked
 * 
 * Source: AchievementsChunk.prototype._read
 */
function parseAchievementsChunk(reader) {
    const count = reader.readS4le();
    const achievements = [];
    
    for (let i = 0; i < count; i++) {
        achievements.push(reader.readU1());
    }
    
    return { count, achievements };
}

/**
 * Parse counters chunk (various game counters)
 * Each counter is int32
 * 
 * Source: CountersChunk.prototype._read
 */
function parseCountersChunk(reader) {
    const count = reader.readS4le();
    const counters = [];
    
    for (let i = 0; i < count; i++) {
        counters.push(reader.readS4le());
    }
    
    return { count, counters };
}

/**
 * Parse level counters chunk
 * Each counter is int32
 * 
 * Source: LevelCountersChunk.prototype._read
 */
function parseLevelCountersChunk(reader) {
    const count = reader.readS4le();
    const counters = [];
    
    for (let i = 0; i < count; i++) {
        counters.push(reader.readS4le());
    }
    
    return { count, counters };
}

/**
 * Parse collectibles (items) chunk
 * Each collectible is 1 byte: 0 = not collected, >0 = collected
 * NOTE: This tracks items actually touched/collected, not just seen
 * 
 * Source: CollectiblesChunk.prototype._read
 */
function parseCollectiblesChunk(reader) {
    const count = reader.readS4le();
    const seenById = []; // Named "seenById" in reference, but actually means "touched/collected"
    
    for (let i = 0; i < count; i++) {
        seenById.push(reader.readU1());
    }
    
    return { count, seenById };
}

/**
 * Parse minibosses chunk
 * Each miniboss is 1 byte
 * 
 * Source: MinibossesChunk.prototype._read  
 */
function parseMinibossesChunk(reader) {
    const count = reader.readS4le();
    const seenById = [];
    
    for (let i = 0; i < count; i++) {
        seenById.push(reader.readU1());
    }
    
    return { count, seenById };
}

/**
 * Parse bosses chunk
 * Each boss is 1 byte
 * 
 * Source: BossesChunk.prototype._read
 */
function parseBossesChunk(reader) {
    const count = reader.readS4le();
    const seenById = [];
    
    for (let i = 0; i < count; i++) {
        seenById.push(reader.readU1());
    }
    
    return { count, seenById };
}

/**
 * Parse challenge counters chunk
 * Each challenge is 1 byte: 0 = not completed, >0 = completed
 * 
 * Source: ChallengeCountersChunk.prototype._read
 */
function parseChallengeCountersChunk(reader) {
    const count = reader.readS4le();
    const completedById = [];
    
    for (let i = 0; i < count; i++) {
        completedById.push(reader.readU1());
    }
    
    return { count, completedById };
}

/**
 * Parse cutscene counters chunk
 * Each counter is int32 (number of times cutscene was seen)
 * 
 * Source: CutsceneCountersChunk.prototype._read
 */
function parseCutsceneCountersChunk(reader) {
    const count = reader.readS4le();
    const countById = [];
    
    for (let i = 0; i < count; i++) {
        countById.push(reader.readS4le());
    }
    
    return { count, countById };
}

/**
 * Parse game settings chunk
 * Each setting is int32
 * 
 * Source: GameSettingsChunk.prototype._read
 */
function parseGameSettingsChunk(reader) {
    const count = reader.readS4le();
    const settings = [];
    
    for (let i = 0; i < count; i++) {
        settings.push(reader.readS4le());
    }
    
    return { count, settings };
}

/**
 * Parse special seed counters chunk (Easter eggs)
 * Each counter is 1 byte
 * 
 * Source: SpecialSeedCountersChunk.prototype._read
 */
function parseSpecialSeedCountersChunk(reader) {
    const count = reader.readS4le();
    const countById = [];
    
    for (let i = 0; i < count; i++) {
        countById.push(reader.readU1());
    }
    
    return { count, countById };
}

/**
 * Parse bestiary counters chunk (enemy encounters/kills/etc)
 * This is more complex with sub-structures
 * 
 * Source: BestiaryCountersChunk.prototype._read
 */
function parseBestiaryCountersChunk(reader) {
    const count = reader.readU4le();
    const counters = [];
    
    // Each counter has: type (s4) + count (s4) + body based on type
    for (let i = 0; i < count; i++) {
        const type = reader.readS4le();
        const subCount = reader.readS4le();
        
        // Each entity value is: entity (s4) + value (s4) = 8 bytes
        const numValues = Math.floor(subCount / 4);
        const values = [];
        
        for (let j = 0; j < numValues; j++) {
            values.push({
                entity: reader.readS4le(),
                value: reader.readS4le()
            });
        }
        
        counters.push({ type, count: subCount, values });
    }
    
    return { count, counters };
}

/**
 * Parse a single chunk based on its type
 * 
 * Source: Chunk.prototype._read (switch statement)
 */
function parseChunkBody(reader, chunkType) {
    switch (chunkType) {
        case ChunkType.ACHIEVEMENTS:
            return parseAchievementsChunk(reader);
        case ChunkType.COUNTERS:
            return parseCountersChunk(reader);
        case ChunkType.LEVEL_COUNTERS:
            return parseLevelCountersChunk(reader);
        case ChunkType.COLLECTIBLES:
            return parseCollectiblesChunk(reader);
        case ChunkType.MINIBOSSES:
            return parseMinibossesChunk(reader);
        case ChunkType.BOSSES:
            return parseBossesChunk(reader);
        case ChunkType.CHALLENGE_COUNTERS:
            return parseChallengeCountersChunk(reader);
        case ChunkType.CUTSCENE_COUNTERS:
            return parseCutsceneCountersChunk(reader);
        case ChunkType.GAME_SETTINGS:
            return parseGameSettingsChunk(reader);
        case ChunkType.SPECIAL_SEED_COUNTERS:
            return parseSpecialSeedCountersChunk(reader);
        case ChunkType.BESTIARY_COUNTERS:
            return parseBestiaryCountersChunk(reader);
        default:
            throw new Error(`Unknown chunk type: ${chunkType}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PARSER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse an Isaac save file
 * 
 * Based on IsaacSaveFile constructor from reference:
 * https://github.com/Zamiell/isaac-save-viewer/blob/main/static/lib/IsaacSaveFile.js
 * 
 * @param {Buffer} buffer - The save file buffer
 * @param {Object} options - { filename, clientHash }
 * @returns {Object} Parsed save data or error
 */
function parseSaveFile(buffer, options = {}) {
    const startMs = Date.now();
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex').substring(0, 16);
    
    console.log(`[Parser V3] Starting parse. Size: ${buffer.length}, Hash: ${fileHash}`);
    
    try {
        // ══════════════════════════════════════════════════════════════════
        // STEP 1: Validate buffer
        // ══════════════════════════════════════════════════════════════════
        
        if (!buffer || buffer.length === 0) {
            return errorResponse(ERROR_CODES.EMPTY_FILE);
        }
        
        if (buffer.length < HEADER_SIZE) {
            return errorResponse(ERROR_CODES.FILE_TOO_SMALL);
        }
        
        if (buffer.length > 100000) { // 100KB max
            return errorResponse(ERROR_CODES.FILE_TOO_LARGE);
        }
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 2: Verify header
        // Source: verifyHeader() in readFile.ts
        // ══════════════════════════════════════════════════════════════════
        
        const headerBytes = buffer.slice(0, 16);
        const headerString = headerBytes.toString('ascii').replace(/\0/g, '').trim();
        
        console.log(`[Parser V3] Header: "${headerString}"`);
        
        // Check if this is a run file (gamestate, not persistent save)
        const runHeaders = [
            HEADERS.REBIRTH_RUN,
            HEADERS.AFTERBIRTH_RUN,
            HEADERS.AFTERBIRTH_PLUS_RUN,
            HEADERS.REPENTANCE_RUN
        ];
        
        if (runHeaders.some(h => headerString.startsWith(h.replace(/\0/g, '')))) {
            return errorResponse(ERROR_CODES.RUN_FILE, {
                detail: 'This is a temporary run state file (gamestate.dat), not a persistent save file (rep_persistentgamedata.dat)'
            });
        }
        
        // Check version
        if (headerString.startsWith(HEADERS.REBIRTH.replace(/\0/g, ''))) {
            return errorResponse(ERROR_CODES.WRONG_VERSION, { detected: 'Rebirth' });
        }
        
        if (headerString.startsWith(HEADERS.AFTERBIRTH.replace(/\0/g, ''))) {
            return errorResponse(ERROR_CODES.WRONG_VERSION, { detected: 'Afterbirth' });
        }
        
        // For Afterbirth+ and Repentance, header is the same
        const expectedHeader = HEADERS.AFTERBIRTH_PLUS_AND_REPENTANCE;
        if (!headerString.startsWith(expectedHeader.replace(/\0/g, '').trim())) {
            return errorResponse(ERROR_CODES.INVALID_HEADER, {
                expected: expectedHeader,
                got: headerString
            });
        }
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 3: Create reader and parse structure
        // Source: IsaacSaveFile._read()
        // ══════════════════════════════════════════════════════════════════
        
        const reader = new BinaryReader(buffer);
        
        // Read header: 16 bytes magic + 4 bytes CRC
        const magic = reader.readBytes(16);
        const crc = reader.readS4le();
        
        console.log(`[Parser V3] Header CRC: ${crc}`);
        
        // Read 11 chunks
        const chunks = {};
        
        for (let i = 0; i < NUM_CHUNKS; i++) {
            const chunkType = reader.readS4le();
            const chunkLen = reader.readS4le(); // Note: "tends to be wrong" according to reference
            
            console.log(`[Parser V3] Chunk ${i}: type=${chunkType}, len=${chunkLen}, pos=${reader.pos}`);
            
            try {
                const body = parseChunkBody(reader, chunkType);
                chunks[chunkType] = { type: chunkType, len: chunkLen, body };
            } catch (e) {
                console.error(`[Parser V3] Error parsing chunk ${chunkType}:`, e.message);
                // Continue to next chunk, don't fail completely
            }
        }
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 4: Verify not Afterbirth+ (has same header as Repentance)
        // Source: verifyNotAfterbirthPlus()
        // ══════════════════════════════════════════════════════════════════
        
        const achievementsChunk = chunks[ChunkType.ACHIEVEMENTS];
        if (achievementsChunk && achievementsChunk.body.count === NUM_AFTERBIRTH_PLUS_ACHIEVEMENTS) {
            return errorResponse(ERROR_CODES.WRONG_VERSION, {
                detected: 'Afterbirth+',
                detail: 'This appears to be an Afterbirth+ save file. Repentance required.'
            });
        }
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 5: Extract data from chunks
        // ══════════════════════════════════════════════════════════════════
        
        // ACHIEVEMENTS
        // Element 0 is padding, real achievements start at index 1
        const achievements = achievementsChunk?.body.achievements || [];
        const achievementCount = achievements.length > 0 ? achievements.length - 1 : 0;
        let achievementsUnlocked = 0;
        const unlockedAchievementIds = [];
        
        for (let i = 1; i < achievements.length; i++) {
            if (achievements[i] !== 0) {
                achievementsUnlocked++;
                unlockedAchievementIds.push(i);
            }
        }
        
        // COLLECTIBLES (items)
        const collectiblesChunk = chunks[ChunkType.COLLECTIBLES];
        const collectibles = collectiblesChunk?.body.seenById || [];
        const collectibleCount = collectibles.length > 0 ? collectibles.length - 1 : 0;
        let itemsCollected = 0;
        const collectedItemIds = [];
        
        for (let i = 1; i < collectibles.length; i++) {
            if (collectibles[i] !== 0) {
                itemsCollected++;
                collectedItemIds.push(i);
            }
        }
        
        // CHALLENGES
        const challengesChunk = chunks[ChunkType.CHALLENGE_COUNTERS];
        const challenges = challengesChunk?.body.completedById || [];
        const challengeCount = challenges.length > 0 ? challenges.length - 1 : 0;
        let challengesCompleted = 0;
        const completedChallengeIds = [];
        
        for (let i = 1; i < challenges.length; i++) {
            if (challenges[i] !== 0) {
                challengesCompleted++;
                completedChallengeIds.push(i);
            }
        }
        
        // BOSSES
        const bossesChunk = chunks[ChunkType.BOSSES];
        const bosses = bossesChunk?.body.seenById || [];
        let bossesSeen = 0;
        
        for (let i = 1; i < bosses.length; i++) {
            if (bosses[i] !== 0) {
                bossesSeen++;
            }
        }
        
        // EASTER EGGS (special seeds)
        const easterEggsChunk = chunks[ChunkType.SPECIAL_SEED_COUNTERS];
        const easterEggs = easterEggsChunk?.body.countById || [];
        let easterEggsUsed = 0;
        
        for (let i = 1; i < easterEggs.length; i++) {
            if (easterEggs[i] !== 0) {
                easterEggsUsed++;
            }
        }
        
        // COUNTERS (various game stats)
        const countersChunk = chunks[ChunkType.COUNTERS];
        const counters = countersChunk?.body.counters || [];
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 6: Calculate percentages and metrics
        // ══════════════════════════════════════════════════════════════════
        
        // Dead God requires ALL achievements
        const totalAchievements = achievementCount;
        const achievementPercent = totalAchievements > 0 
            ? Math.round((achievementsUnlocked / totalAchievements) * 10000) / 100 
            : 0;
        
        // Items percentage
        const totalItems = collectibleCount;
        const itemsPercent = totalItems > 0 
            ? Math.round((itemsCollected / totalItems) * 10000) / 100 
            : 0;
        
        // Challenges percentage
        const totalChallenges = challengeCount;
        const challengesPercent = totalChallenges > 0 
            ? Math.round((challengesCompleted / totalChallenges) * 10000) / 100 
            : 0;
        
        // Dead God = 100% achievements (this IS Dead God progress)
        const deadGodPercent = achievementPercent;
        const isDeadGod = achievementsUnlocked >= totalAchievements && totalAchievements > 0;
        
        const parseMs = Date.now() - startMs;
        
        console.log(`[Parser V3] Parse SUCCESS in ${parseMs}ms:`);
        console.log(`  Achievements: ${achievementsUnlocked}/${totalAchievements} (${achievementPercent}%)`);
        console.log(`  Items: ${itemsCollected}/${totalItems} (${itemsPercent}%)`);
        console.log(`  Challenges: ${challengesCompleted}/${totalChallenges} (${challengesPercent}%)`);
        console.log(`  Dead God: ${deadGodPercent}%`);
        
        // ══════════════════════════════════════════════════════════════════
        // STEP 7: Build response
        // ══════════════════════════════════════════════════════════════════
        
        return {
            ok: true,
            source: 'real',
            error_code: null,
            error_message: null,
            
            meta: {
                fileName: options.filename || 'unknown',
                fileSize: buffer.length,
                sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
                parsedAt: new Date().toISOString(),
                parserVersion: PARSER_VERSION,
                gameVariant: 'repentance',
                parseMs
            },
            
            progress: {
                deadGodPercent,
                isDeadGod,
                breakdown: {
                    achievements: {
                        count: achievementsUnlocked,
                        total: totalAchievements,
                        percent: achievementPercent
                    },
                    items: {
                        count: itemsCollected,
                        total: totalItems,
                        percent: itemsPercent
                    },
                    challenges: {
                        count: challengesCompleted,
                        total: totalChallenges,
                        percent: challengesPercent
                    },
                    bosses: {
                        count: bossesSeen,
                        total: bosses.length > 0 ? bosses.length - 1 : 0
                    },
                    easterEggs: {
                        count: easterEggsUsed,
                        total: easterEggs.length > 0 ? easterEggs.length - 1 : 0
                    }
                }
            },
            
            achievements: {
                total: totalAchievements,
                unlocked: achievementsUnlocked,
                unlockedIds: unlockedAchievementIds,
                percent: achievementPercent
            },
            
            items: {
                total: totalItems,
                collected: itemsCollected,
                collectedIds: collectedItemIds,
                percent: itemsPercent
            },
            
            challenges: {
                total: totalChallenges,
                completed: challengesCompleted,
                completedIds: completedChallengeIds,
                percent: challengesPercent
            },
            
            // Raw chunk data for advanced usage
            raw: {
                achievementsArray: achievements,
                collectiblesArray: collectibles,
                challengesArray: challenges,
                bossesArray: bosses,
                easterEggsArray: easterEggs,
                counters: counters
            },
            
            // Legacy compatibility fields
            parsed: {
                achievementsUnlocked,
                totalAchievements,
                itemsCollected,
                totalItems,
                challengesCompleted: challengesCompleted,
                totalChallenges
            },
            
            metrics: {
                deadGodPercentage: deadGodPercent,
                achievementPercentage: achievementPercent,
                itemsPercentage: itemsPercent,
                challengesPercentage: challengesPercent
            }
        };
        
    } catch (error) {
        console.error(`[Parser V3] CRITICAL ERROR:`, error);
        return errorResponse(ERROR_CODES.PARSE_ERROR, {
            message: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
}

/**
 * Creates an error response object
 */
function errorResponse(errorDef, details = {}) {
    return {
        ok: false,
        source: 'error',
        error_code: errorDef.code,
        error_message: errorDef.message,
        details,
        meta: null,
        progress: null,
        achievements: null,
        items: null,
        challenges: null,
        raw: null,
        parsed: null,
        metrics: null
    };
}

/**
 * Validates a save file buffer
 */
function validateSaveFile(buffer) {
    if (!buffer) {
        return { valid: false, error: 'NO_FILE', message: 'No buffer provided' };
    }
    
    if (buffer.length === 0) {
        return { valid: false, error: 'EMPTY_FILE', message: 'Buffer is empty' };
    }
    
    if (buffer.length < HEADER_SIZE) {
        return { valid: false, error: 'FILE_TOO_SMALL', message: 'File too small' };
    }
    
    const headerString = buffer.slice(0, 16).toString('ascii').replace(/\0/g, '').trim();
    const expectedHeader = HEADERS.AFTERBIRTH_PLUS_AND_REPENTANCE.replace(/\0/g, '').trim();
    
    if (!headerString.startsWith(expectedHeader)) {
        return { valid: false, error: 'INVALID_HEADER', message: `Invalid header: ${headerString}` };
    }
    
    return { valid: true };
}

/**
 * Detects slot number from filename
 */
function detectSlot(filename) {
    if (!filename) return 1;
    const match = filename.match(/persistentgamedata(\d)/i) || filename.match(/rep_(\d)/i);
    return match ? parseInt(match[1], 10) : 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    parseSaveFile,
    validateSaveFile,
    detectSlot,
    BinaryReader,
    ChunkType,
    HEADERS,
    PARSER_VERSION,
    ERROR_CODES
};
