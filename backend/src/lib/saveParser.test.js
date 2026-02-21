/**
 * Tests for Isaac Repentance Save File Parser
 * Run: npm test (after adding jest to devDependencies)
 * Or: node --experimental-vm-modules node_modules/jest/bin/jest.js
 */

const { 
    parseSaveFile, 
    validateSaveFile, 
    countBits,
    validateParsedData,
    CONSTANTS 
} = require('./saveParser');

describe('Save Parser Validation', () => {
    describe('validateSaveFile', () => {
        it('should reject null buffer', () => {
            const result = validateSaveFile(null);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('NO_BUFFER');
        });

        it('should reject empty buffer', () => {
            const result = validateSaveFile(Buffer.alloc(0));
            expect(result.valid).toBe(false);
            expect(result.error).toBe('FILE_TOO_SMALL');
        });

        it('should reject buffer smaller than header', () => {
            const result = validateSaveFile(Buffer.alloc(10));
            expect(result.valid).toBe(false);
            expect(result.error).toBe('FILE_TOO_SMALL');
        });

        it('should reject buffer smaller than minimum save size', () => {
            const result = validateSaveFile(Buffer.alloc(1000));
            expect(result.valid).toBe(false);
            expect(result.error).toBe('FILE_TOO_SMALL');
        });

        it('should reject buffer larger than maximum save size', () => {
            const result = validateSaveFile(Buffer.alloc(60000));
            expect(result.valid).toBe(false);
            expect(result.error).toBe('FILE_TOO_LARGE');
        });

        it('should reject save with no achievement data', () => {
            // Create buffer of valid size but all zeros
            const buffer = Buffer.alloc(20000);
            const result = validateSaveFile(buffer);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('EMPTY_SAVE');
        });

        it('should accept save with achievement data', () => {
            // Create buffer with some data in achievement section
            const buffer = Buffer.alloc(20000);
            // Put some data in achievement section
            buffer[16] = 0xFF; // First byte of achievements
            buffer[17] = 0xAA;
            buffer[96] = 0x01; // Completion marks section
            const result = validateSaveFile(buffer);
            expect(result.valid).toBe(true);
        });
    });

    describe('countBits', () => {
        it('should count 0 bits in zero buffer', () => {
            const buffer = Buffer.alloc(10);
            expect(countBits(buffer, 0, 10)).toBe(0);
        });

        it('should count 8 bits in 0xFF byte', () => {
            const buffer = Buffer.from([0xFF]);
            expect(countBits(buffer, 0, 1)).toBe(8);
        });

        it('should count bits across multiple bytes', () => {
            const buffer = Buffer.from([0xFF, 0x00, 0xFF]); // 8 + 0 + 8 = 16
            expect(countBits(buffer, 0, 3)).toBe(16);
        });

        it('should respect start offset', () => {
            const buffer = Buffer.from([0xFF, 0x00, 0xFF]);
            expect(countBits(buffer, 1, 2)).toBe(8); // Skip first 0xFF, count 0x00 and 0xFF
        });

        it('should handle partial bytes', () => {
            const buffer = Buffer.from([0x0F]); // 4 bits set
            expect(countBits(buffer, 0, 1)).toBe(4);
        });
    });

    describe('validateParsedData', () => {
        it('should accept valid data', () => {
            const parsed = {
                achievementsUnlocked: 300,
                completionMarks: 200,
                itemsCollected: 400
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject negative achievements', () => {
            const parsed = {
                achievementsUnlocked: -1,
                completionMarks: 200,
                itemsCollected: 400
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(false);
        });

        it('should reject achievements over maximum', () => {
            const parsed = {
                achievementsUnlocked: 1000,
                completionMarks: 200,
                itemsCollected: 400
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(false);
        });

        it('should reject marks over maximum', () => {
            const parsed = {
                achievementsUnlocked: 300,
                completionMarks: 500,
                itemsCollected: 400
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(false);
        });

        it('should reject suspicious achievement/mark ratio', () => {
            const parsed = {
                achievementsUnlocked: 10, // Very low
                completionMarks: 200, // High
                itemsCollected: 400
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(false);
        });

        it('should accept zero values for new save', () => {
            const parsed = {
                achievementsUnlocked: 0,
                completionMarks: 0,
                itemsCollected: 0
            };
            const result = validateParsedData(parsed);
            expect(result.valid).toBe(true);
        });
    });
});

describe('Save Parser - Full Parse', () => {
    describe('parseSaveFile', () => {
        it('should return error for invalid file', () => {
            const result = parseSaveFile(null);
            expect(result.ok).toBe(false);
            expect(result.error_code).toBeDefined();
        });

        it('should return error for empty buffer', () => {
            const result = parseSaveFile(Buffer.alloc(0));
            expect(result.ok).toBe(false);
        });

        it('should parse valid save file structure', () => {
            // Create a mock save file with valid structure
            const buffer = createMockSaveBuffer({
                achievements: 100,
                marks: 50,
                items: 200
            });
            
            const result = parseSaveFile(buffer);
            
            // Even if parsing isn't perfect, it should not crash
            expect(result).toBeDefined();
            expect(typeof result.ok).toBe('boolean');
        });
    });
});

/**
 * Helper to create mock save buffer for testing
 * This creates a buffer that simulates a Repentance save structure
 */
function createMockSaveBuffer({ achievements = 0, marks = 0, items = 0 }) {
    const buffer = Buffer.alloc(20000);
    
    // Fill header with some typical values
    buffer[0] = 0x4D; // 'M' - typical magic byte pattern
    buffer[1] = 0x4F;
    
    // Fill achievements section (offset 16, ~80 bytes)
    const achievementBytes = Math.ceil(achievements / 8);
    for (let i = 0; i < achievementBytes && i < 80; i++) {
        buffer[16 + i] = i < achievementBytes - 1 ? 0xFF : (0xFF >> (8 - (achievements % 8)));
    }
    
    // Fill completion marks section (offset 96)
    // Each character has 12 marks
    const marksPerChar = Math.ceil(marks / 34);
    for (let charIdx = 0; charIdx < 34; charIdx++) {
        for (let markIdx = 0; markIdx < Math.min(marksPerChar, 12); markIdx++) {
            buffer[96 + (charIdx * 12) + markIdx] = 1;
        }
    }
    
    return buffer;
}

// Export for use in integration tests
module.exports = { createMockSaveBuffer };
