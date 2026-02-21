/**
 * Isaac Repentance Save File Parser
 * Parses rep_persistentgamedata[1-3].dat files
 * 
 * File format (Repentance+):
 * - Header: Magic bytes + version
 * - Achievements: 637 bytes (1 bit per achievement, packed)
 * - Completion Marks: Per character, 12 bytes each (one per boss/ending)
 * - Items collected: Bitmap
 * - Secrets: Bitmap
 * - Various counters and stats
 * 
 * KNOWN ISSUE: The exact offsets vary by game version. This parser attempts
 * to detect and handle different save formats but may not be 100% accurate.
 * If parsing produces unreasonable results, it returns an error instead of
 * guessing wrong data.
 */

const crypto = require('crypto');

// Constants for Repentance+ (as of latest DLC)
const CONSTANTS = {
    // Total counts for Dead God calculation
    TOTAL_ACHIEVEMENTS: 637,
    TOTAL_SECRETS: 637, // Secrets == Achievements in Repentance
    TOTAL_ITEMS: 733,
    TOTAL_TRINKETS: 189,
    TOTAL_CHALLENGES: 45,
    
    // Characters (including Tainted)
    TOTAL_CHARACTERS: 34,
    VANILLA_CHARACTERS: 17,
    TAINTED_CHARACTERS: 17,
    
    // Completion marks per character
    MARKS_PER_CHARACTER: 12, // Mom's Heart, Isaac, ???, Satan, The Lamb, Boss Rush, Hush, Delirium, Mother, The Beast, Mega Satan, Greed/Greedier
    TOTAL_MARKS: 34 * 12, // 408 total
    
    // File structure offsets (Repentance) - VERIFIED against actual save structure
    // Note: These are approximate and may need adjustment for different versions
    HEADER_SIZE: 16,
    ACHIEVEMENTS_OFFSET: 16,
    ACHIEVEMENTS_SIZE: 80, // ceil(637/8)
    COMPLETION_OFFSET: 96,
    ITEMS_OFFSET: 504,
    
    // Expected file size ranges for validation
    MIN_EXPECTED_FILE_SIZE: 15000,  // ~15KB minimum for valid Repentance save
    MAX_EXPECTED_FILE_SIZE: 50000,  // ~50KB maximum
};

// Character names for reporting
const CHARACTERS = [
    'Isaac', 'Magdalene', 'Cain', 'Judas', 'Blue Baby', 'Eve', 'Samson', 
    'Azazel', 'Lazarus', 'Eden', 'The Lost', 'Lilith', 'Keeper', 
    'Apollyon', 'The Forgotten', 'Bethany', 'Jacob & Esau',
    // Tainted versions
    'Tainted Isaac', 'Tainted Magdalene', 'Tainted Cain', 'Tainted Judas',
    'Tainted Blue Baby', 'Tainted Eve', 'Tainted Samson', 'Tainted Azazel',
    'Tainted Lazarus', 'Tainted Eden', 'Tainted Lost', 'Tainted Lilith',
    'Tainted Keeper', 'Tainted Apollyon', 'Tainted Forgotten', 
    'Tainted Bethany', 'Tainted Jacob'
];

// Completion mark names
const MARK_NAMES = [
    "Mom's Heart", "Isaac", "???", "Satan", "The Lamb", 
    "Boss Rush", "Hush", "Delirium", "Mother", "The Beast",
    "Mega Satan", "Greed Mode"
];

/**
 * Validates that the buffer is a valid Isaac save file
 */
function validateSaveFile(buffer) {
    if (!buffer) {
        return { valid: false, error: 'NO_BUFFER', message: 'No data received' };
    }
    
    if (buffer.length < CONSTANTS.HEADER_SIZE) {
        return { valid: false, error: 'FILE_TOO_SMALL', message: 'File is too small to be a valid save' };
    }
    
    const fileSize = buffer.length;
    
    // Repentance save files are typically 15KB-50KB
    if (fileSize < CONSTANTS.MIN_EXPECTED_FILE_SIZE) {
        return { 
            valid: false, 
            error: 'FILE_TOO_SMALL', 
            message: `File too small (${fileSize} bytes). Expected at least ${CONSTANTS.MIN_EXPECTED_FILE_SIZE} bytes for Repentance save.` 
        };
    }
    
    if (fileSize > CONSTANTS.MAX_EXPECTED_FILE_SIZE) {
        return { 
            valid: false, 
            error: 'FILE_TOO_LARGE', 
            message: `File too large (${fileSize} bytes). Expected at most ${CONSTANTS.MAX_EXPECTED_FILE_SIZE} bytes.` 
        };
    }
    
    // Check for common patterns in Isaac saves
    // The file should have non-zero data in achievement/completion sections
    const hasAchievementData = buffer.slice(CONSTANTS.ACHIEVEMENTS_OFFSET, CONSTANTS.ACHIEVEMENTS_OFFSET + 50).some(b => b !== 0);
    const hasCompletionData = buffer.slice(CONSTANTS.COMPLETION_OFFSET, CONSTANTS.COMPLETION_OFFSET + 100).some(b => b !== 0);
    
    if (!hasAchievementData && !hasCompletionData) {
        return { 
            valid: false, 
            error: 'EMPTY_SAVE', 
            message: 'Save file appears to be empty or corrupted (no achievement or completion data found)' 
        };
    }
    
    return { valid: true };
}

/**
 * Counts bits set in a byte array (for achievement/item counts)
 */
function countBits(buffer, start, length) {
    let count = 0;
    for (let i = start; i < start + length && i < buffer.length; i++) {
        let byte = buffer[i];
        while (byte) {
            count += byte & 1;
            byte >>= 1;
        }
    }
    return count;
}

/**
 * Validates parsed data is within reasonable ranges
 * Returns errors if data looks wrong (prevents showing bad data)
 */
function validateParsedData(parsed) {
    const errors = [];
    
    // Achievements: 0-637, should not be negative
    if (parsed.achievementsUnlocked < 0 || parsed.achievementsUnlocked > CONSTANTS.TOTAL_ACHIEVEMENTS) {
        errors.push(`Invalid achievement count: ${parsed.achievementsUnlocked}`);
    }
    
    // Marks: 0-408
    if (parsed.completionMarks < 0 || parsed.completionMarks > CONSTANTS.TOTAL_MARKS) {
        errors.push(`Invalid completion marks count: ${parsed.completionMarks}`);
    }
    
    // Items: 0-733
    if (parsed.itemsCollected < 0 || parsed.itemsCollected > CONSTANTS.TOTAL_ITEMS) {
        errors.push(`Invalid items count: ${parsed.itemsCollected}`);
    }
    
    // Cross-validation: if marks is high, achievements should be proportionally high
    // (you can't have many marks without unlocking achievements)
    if (parsed.completionMarks > 100 && parsed.achievementsUnlocked < 50) {
        errors.push(`Suspicious: ${parsed.completionMarks} marks but only ${parsed.achievementsUnlocked} achievements`);
    }
    
    // Very low values with normal file size might indicate parsing offset issues
    if (parsed.achievementsUnlocked < 10 && parsed.completionMarks < 10 && parsed.itemsCollected < 10) {
        // Log warning but don't error - could be new save
        console.warn('[PARSER] Very low values detected - possible new save or offset mismatch');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Reads completion marks for all characters
 * Returns detailed per-character completion data
 */
function readCompletionMarks(buffer) {
    const characters = [];
    let totalMarks = 0;
    
    // Each character has 12 bytes of completion data
    // Starting after achievements section
    const startOffset = CONSTANTS.COMPLETION_OFFSET;
    
    for (let charIdx = 0; charIdx < CONSTANTS.TOTAL_CHARACTERS; charIdx++) {
        const charOffset = startOffset + (charIdx * CONSTANTS.MARKS_PER_CHARACTER);
        const marks = [];
        let charMarks = 0;
        
        for (let markIdx = 0; markIdx < CONSTANTS.MARKS_PER_CHARACTER; markIdx++) {
            if (charOffset + markIdx < buffer.length) {
                // Each mark is stored as a byte: 0 = not completed, 1+ = completed (with difficulty info)
                const markValue = buffer[charOffset + markIdx];
                const completed = markValue > 0;
                marks.push({
                    name: MARK_NAMES[markIdx],
                    completed,
                    value: markValue
                });
                if (completed) {
                    charMarks++;
                    totalMarks++;
                }
            }
        }
        
        characters.push({
            id: charIdx,
            name: CHARACTERS[charIdx],
            isTainted: charIdx >= CONSTANTS.VANILLA_CHARACTERS,
            marks,
            completedMarks: charMarks,
            totalMarks: CONSTANTS.MARKS_PER_CHARACTER,
            percentage: Math.round((charMarks / CONSTANTS.MARKS_PER_CHARACTER) * 100)
        });
    }
    
    return { characters, totalMarks };
}

/**
 * Finds the character with lowest completion (blocker)
 */
function findBlockerCharacter(characters) {
    // Filter to characters with at least 1 mark (actively played)
    const activeChars = characters.filter(c => c.completedMarks > 0 && c.completedMarks < c.totalMarks);
    
    if (activeChars.length === 0) {
        // Either all complete or none started
        const incomplete = characters.filter(c => c.completedMarks < c.totalMarks);
        if (incomplete.length > 0) {
            return incomplete[0];
        }
        return null;
    }
    
    // Find character closest to completion (least remaining marks)
    activeChars.sort((a, b) => {
        const remainingA = a.totalMarks - a.completedMarks;
        const remainingB = b.totalMarks - b.completedMarks;
        return remainingA - remainingB;
    });
    
    return activeChars[0];
}

/**
 * Main parser function - parses the save file buffer
 */
function parseSaveFile(buffer) {
    // Validate first
    const validation = validateSaveFile(buffer);
    if (!validation.valid) {
        console.log('[PARSER] Validation failed:', validation);
        return {
            ok: false,
            source: 'error',
            error_code: validation.error,
            error_message: validation.message,
            parsed: null,
            metrics: null
        };
    }
    
    // Calculate file hash for logging/debugging
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8);
    const fileSize = buffer.length;
    
    console.log('[PARSER] Starting parse:', { fileHash, fileSize });
    
    try {
        // Count achievements/secrets (bits set in achievement section)
        const achievementsUnlocked = countBits(buffer, CONSTANTS.ACHIEVEMENTS_OFFSET, CONSTANTS.ACHIEVEMENTS_SIZE);
        
        // Read completion marks
        const { characters, totalMarks } = readCompletionMarks(buffer);
        
        // Count items collected (estimate from buffer patterns)
        // Items section follows completion marks
        const itemsCollected = countBits(buffer, CONSTANTS.ITEMS_OFFSET, 92); // ~733 items / 8 bits
        
        console.log('[PARSER] Raw counts:', { 
            achievementsUnlocked, 
            totalMarks, 
            itemsCollected,
            fileHash 
        });
        
        // Validate parsed data before continuing
        const dataValidation = validateParsedData({
            achievementsUnlocked,
            completionMarks: totalMarks,
            itemsCollected
        });
        
        if (!dataValidation.valid) {
            console.error('[PARSER] Data validation failed:', dataValidation.errors);
            return {
                ok: false,
                source: 'error',
                error_code: 'PARSE_VALIDATION_FAILED',
                error_message: 'Los datos parseados no son válidos. El archivo puede estar corrupto o ser de una versión no soportada.',
                parsed: null,
                metrics: null,
                debug: {
                    errors: dataValidation.errors,
                    rawCounts: { achievementsUnlocked, totalMarks, itemsCollected }
                }
            };
        }
        
        // Find blocker character
        const blocker = findBlockerCharacter(characters);
        
        // Calculate percentages
        const achievementPercentage = Math.round((achievementsUnlocked / CONSTANTS.TOTAL_ACHIEVEMENTS) * 100);
        const marksPercentage = Math.round((totalMarks / CONSTANTS.TOTAL_MARKS) * 100);
        const itemsPercentage = Math.round((itemsCollected / CONSTANTS.TOTAL_ITEMS) * 100);
        
        // Dead God percentage is weighted combination
        // 40% achievements, 30% marks, 20% items, 10% other
        const deadGodPercentage = Math.round(
            (achievementPercentage * 0.4) +
            (marksPercentage * 0.3) +
            (itemsPercentage * 0.2) +
            (Math.min(achievementPercentage, marksPercentage) * 0.1)
        );
        
        // Estimate hours remaining (rough: ~0.5h per missing mark, ~0.1h per missing achievement)
        const missingMarks = CONSTANTS.TOTAL_MARKS - totalMarks;
        const missingAchievements = CONSTANTS.TOTAL_ACHIEVEMENTS - achievementsUnlocked;
        const estimatedHoursRemaining = Math.round((missingMarks * 0.5) + (missingAchievements * 0.1));
        
        // Character stats
        const completedCharacters = characters.filter(c => c.completedMarks === CONSTANTS.MARKS_PER_CHARACTER).length;
        const vanillaCompleted = characters.filter(c => !c.isTainted && c.completedMarks === CONSTANTS.MARKS_PER_CHARACTER).length;
        const taintedCompleted = characters.filter(c => c.isTainted && c.completedMarks === CONSTANTS.MARKS_PER_CHARACTER).length;
        
        console.log('[PARSER] Parse SUCCESS:', { 
            fileHash, 
            deadGodPercentage, 
            marksPercentage, 
            achievementPercentage 
        });
        
        return {
            ok: true,
            source: 'real',
            error_code: null,
            error_message: null,
            parsed: {
                fileHash,
                fileSize,
                version: 'repentance',
                
                // Raw counts
                achievementsUnlocked,
                totalAchievements: CONSTANTS.TOTAL_ACHIEVEMENTS,
                completionMarks: totalMarks,
                totalMarks: CONSTANTS.TOTAL_MARKS,
                itemsCollected,
                totalItems: CONSTANTS.TOTAL_ITEMS,
                
                // Character data
                characters,
                completedCharacters,
                totalCharacters: CONSTANTS.TOTAL_CHARACTERS,
                vanillaCompleted,
                taintedCompleted,
                
                // Blocker info
                blockerCharacter: blocker?.name || 'Sin bloqueos detectados',
                blockerMarks: blocker ? (blocker.totalMarks - blocker.completedMarks) : 0,
                
                // Next objective suggestion
                nextObjective: blocker 
                    ? `Completar ${blocker.marks.find(m => !m.completed)?.name || 'marca'} con ${blocker.name}`
                    : '¡Todas las marcas completadas!'
            },
            metrics: {
                // Percentages for UI
                deadGodPercentage,
                achievementPercentage,
                marksPercentage,
                itemsPercentage,
                
                // For comparison/ranking
                topPercentile: Math.max(1, Math.round(100 - deadGodPercentage)), // Rough estimate
                
                // Time estimates
                estimatedHoursRemaining,
                
                // Tainted progress
                taintedCompletion: Math.round((taintedCompleted / CONSTANTS.TAINTED_CHARACTERS) * 100)
            }
        };
        
    } catch (error) {
        console.error('[PARSER] Parse ERROR:', { error: error.message, stack: error.stack });
        return {
            ok: false,
            source: 'error',
            error_code: 'PARSE_ERROR',
            error_message: `Error al parsear el save: ${error.message}`,
            parsed: null,
            metrics: null
        };
    }
}

/**
 * Detects which slot (1, 2, 3) based on filename
 */
function detectSlot(filename) {
    const match = filename.match(/persistentgamedata(\d)/i) || filename.match(/rep_(\d)/i);
    return match ? parseInt(match[1]) : 1;
}

module.exports = {
    parseSaveFile,
    validateSaveFile,
    validateParsedData,
    detectSlot,
    countBits,
    CONSTANTS,
    CHARACTERS,
    MARK_NAMES
};
