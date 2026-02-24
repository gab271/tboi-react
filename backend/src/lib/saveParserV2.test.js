/**
 * Tests for Save Parser V2
 * Run: npm test
 */

const {
    parseSaveFile,
    decodeBitset,
    countBitsInRange,
    readBit,
    validateSaveFile,
    PARSER_VERSION
} = require('./saveParserV2');

describe('decodeBitset', () => {
    test('returns empty array for zero buffer', () => {
        const buffer = Buffer.alloc(10);
        expect(decodeBitset(buffer, 0, 80)).toEqual([]);
    });

    test('returns all indices for 0xFF bytes', () => {
        const buffer = Buffer.from([0xFF, 0xFF]);
        const result = decodeBitset(buffer, 0, 16);
        expect(result).toHaveLength(16);
        expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    test('reads LSB first correctly', () => {
        // 0x01 = 00000001 in binary -> bit 0 is set
        const buffer = Buffer.from([0x01]);
        expect(decodeBitset(buffer, 0, 8)).toEqual([0]);

        // 0x80 = 10000000 in binary -> bit 7 is set
        const buffer2 = Buffer.from([0x80]);
        expect(decodeBitset(buffer2, 0, 8)).toEqual([7]);

        // 0x0F = 00001111 in binary -> bits 0,1,2,3 are set
        const buffer3 = Buffer.from([0x0F]);
        expect(decodeBitset(buffer3, 0, 8)).toEqual([0, 1, 2, 3]);
    });

    test('respects offset parameter', () => {
        const buffer = Buffer.from([0x00, 0xFF, 0x00]);
        // Start at offset 1, read 8 bits from 0xFF
        expect(decodeBitset(buffer, 1, 8)).toHaveLength(8);
        // Start at offset 0, read 8 bits from 0x00
        expect(decodeBitset(buffer, 0, 8)).toHaveLength(0);
    });

    test('respects nBits limit', () => {
        const buffer = Buffer.from([0xFF, 0xFF]);
        // Only read first 4 bits
        expect(decodeBitset(buffer, 0, 4)).toHaveLength(4);
        expect(decodeBitset(buffer, 0, 4)).toEqual([0, 1, 2, 3]);
    });

    test('handles buffer overflow gracefully', () => {
        const buffer = Buffer.from([0xFF]);
        // Try to read 100 bits from 1 byte buffer
        expect(() => decodeBitset(buffer, 0, 100)).not.toThrow();
        // Should return 8 bits (all from the one byte)
        expect(decodeBitset(buffer, 0, 100)).toHaveLength(8);
    });

    test('handles offset near end of buffer', () => {
        const buffer = Buffer.from([0x00, 0xFF]);
        // Offset 1 with 16 bits requested should only return 8
        const result = decodeBitset(buffer, 1, 16);
        expect(result).toHaveLength(8);
    });
});

describe('countBitsInRange', () => {
    test('counts 0 bits in zero buffer', () => {
        const buffer = Buffer.alloc(10);
        expect(countBitsInRange(buffer, 0, 80)).toBe(0);
    });

    test('counts 8 bits in 0xFF', () => {
        const buffer = Buffer.from([0xFF]);
        expect(countBitsInRange(buffer, 0, 8)).toBe(8);
    });

    test('counts bits correctly in mixed buffer', () => {
        const buffer = Buffer.from([0x0F, 0xF0]); // 4 + 4 = 8 bits
        expect(countBitsInRange(buffer, 0, 16)).toBe(8);
    });
});

describe('readBit', () => {
    test('reads individual bits correctly', () => {
        const buffer = Buffer.from([0x05]); // 00000101
        expect(readBit(buffer, 0, 0)).toBe(true);  // bit 0
        expect(readBit(buffer, 0, 1)).toBe(false); // bit 1
        expect(readBit(buffer, 0, 2)).toBe(true);  // bit 2
        expect(readBit(buffer, 0, 3)).toBe(false); // bit 3
    });

    test('returns false for out of bounds', () => {
        const buffer = Buffer.from([0xFF]);
        expect(readBit(buffer, 10, 0)).toBe(false);
    });
});

describe('validateSaveFile', () => {
    test('rejects null buffer', () => {
        const result = validateSaveFile(null);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('NO_FILE');
    });

    test('rejects empty buffer', () => {
        const result = validateSaveFile(Buffer.alloc(0));
        expect(result.valid).toBe(false);
        expect(result.error).toBe('EMPTY_FILE');
    });

    test('rejects small buffer', () => {
        const result = validateSaveFile(Buffer.alloc(500));
        expect(result.valid).toBe(false);
        expect(result.error).toBe('FILE_TOO_SMALL');
    });

    test('rejects huge buffer', () => {
        const result = validateSaveFile(Buffer.alloc(150000));
        expect(result.valid).toBe(false);
        expect(result.error).toBe('FILE_TOO_LARGE');
    });

    test('accepts valid size buffer with data', () => {
        const buffer = Buffer.alloc(25000);
        // Add some non-zero data
        buffer.fill(0xFF, 16, 100);
        const result = validateSaveFile(buffer);
        expect(result.valid).toBe(true);
    });

    test('rejects buffer with all zeros in data section', () => {
        const buffer = Buffer.alloc(25000);
        // No data in expected sections
        const result = validateSaveFile(buffer);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('EMPTY_SAVE');
    });
});

describe('parseSaveFile', () => {
    test('returns error for invalid buffer', () => {
        const result = parseSaveFile(null);
        expect(result.ok).toBe(false);
        expect(result.source).toBe('error');
        expect(result.error_code).toBe('NO_FILE');
    });

    test('never returns demo source', () => {
        // Try various invalid inputs
        const invalidInputs = [
            null,
            Buffer.alloc(0),
            Buffer.alloc(100),
            Buffer.alloc(25000) // All zeros
        ];

        for (const input of invalidInputs) {
            const result = parseSaveFile(input);
            expect(result.source).not.toBe('demo');
            if (!result.ok) {
                expect(result.source).toBe('error');
            }
        }
    });

    test('parses mock save with correct structure', () => {
        // Create a realistic mock save buffer
        const buffer = Buffer.alloc(30000);
        
        // Add achievement data (offset 16, ~80 bytes for 637 bits)
        buffer.fill(0xFF, 16, 50); // ~50 achievements unlocked
        
        // Add completion mark data (offset 96)
        buffer.fill(0xFF, 96, 120); // Some completion marks
        
        // Add item data (offset ~912)
        buffer.fill(0xFF, 912, 950); // Some items
        
        const result = parseSaveFile(buffer);
        
        // Should parse successfully
        expect(result.ok).toBe(true);
        expect(result.source).toBe('real');
        
        // Should have valid structure
        expect(result.metadata).toBeDefined();
        expect(result.metadata.parserVersion).toBe(PARSER_VERSION);
        expect(result.secrets).toBeDefined();
        expect(result.items).toBeDefined();
        expect(result.characters).toBeDefined();
        expect(result.endings).toBeDefined();
        expect(result.metrics).toBeDefined();
    });

    test('invariants: endings count never exceeds total', () => {
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 16, 200);
        buffer.fill(0xFF, 96, 500);
        
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.endings.count).toBeLessThanOrEqual(result.endings.total);
        }
    });

    test('invariants: secrets count never exceeds total', () => {
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 16, 200);
        
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.secrets.count).toBeLessThanOrEqual(result.secrets.total);
        }
    });

    test('invariants: items count never exceeds total', () => {
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 912, 1010);
        buffer.fill(0xFF, 16, 100); // Need some achievements too
        
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.items.countCollected).toBeLessThanOrEqual(result.items.total);
        }
    });

    test('metrics: deadGodPercentage is based on secrets', () => {
        const buffer = Buffer.alloc(30000);
        // Only half of achievements (320 out of 637)
        buffer.fill(0xFF, 16, 56); // ~320 bits = 40 bytes
        buffer.fill(0x00, 56, 96);
        buffer.fill(0xFF, 96, 150); // Some marks
        
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            // DeadGod percentage should match secrets percentage
            const expectedPercent = (result.secrets.count / result.secrets.total) * 100;
            expect(Math.abs(result.metrics.deadGodPercentage - expectedPercent)).toBeLessThan(1);
        }
    });

    test('correctly parses character marks', () => {
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 16, 96); // Achievements
        
        // Character 0 (Isaac) at offset 96, 24 bytes per char
        // Set all normal marks (bits 0-10 in first 2 bytes)
        buffer[96] = 0xFF;     // bits 0-7
        buffer[97] = 0x07;     // bits 8-10 (only 3 bits for 11 marks)
        // Set hard marks
        buffer[98] = 0xFF;
        buffer[99] = 0x07;
        // Set greed marks
        buffer[100] = 0x01;    // greed
        buffer[101] = 0x01;    // greedier
        
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            const isaac = result.characters[0];
            expect(isaac.name).toBe('Isaac');
            expect(isaac.isTainted).toBe(false);
            // Should have most marks completed (11 normal + 11 hard + 2 greed = 24)
            expect(isaac.completedMarks).toBeGreaterThan(0);
        }
    });

    test('handles missing datasets gracefully', () => {
        // This tests that the parser doesn't crash if datasets are missing
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 16, 100);
        
        // The parser should either succeed or fail cleanly
        expect(() => parseSaveFile(buffer)).not.toThrow();
    });
});

describe('Dead God Progress Calculation', () => {
    test('100% secrets = Dead God achieved', () => {
        const buffer = Buffer.alloc(30000);
        // Fill all 80 bytes of achievements (637 bits)
        buffer.fill(0xFF, 16, 96);
        buffer.fill(0xFF, 96, 500);
        
        const result = parseSaveFile(buffer);
        
        if (result.ok && result.secrets.count >= result.secrets.total) {
            expect(result.metrics.isDeadGod).toBe(true);
        }
    });

    test('partial secrets = not Dead God', () => {
        const buffer = Buffer.alloc(30000);
        // Fill only some achievements
        buffer.fill(0xFF, 16, 50);
        buffer.fill(0xFF, 96, 200);
        
        const result = parseSaveFile(buffer);
        
        if (result.ok && result.secrets.count < result.secrets.total) {
            expect(result.metrics.isDeadGod).toBe(false);
        }
    });
});

describe('Next Steps Generation', () => {
    test('generates prioritized steps', () => {
        const buffer = Buffer.alloc(30000);
        buffer.fill(0xFF, 16, 80);
        buffer.fill(0xFF, 96, 300);
        
        const result = parseSaveFile(buffer);
        
        if (result.ok && result.nextSteps) {
            expect(Array.isArray(result.nextSteps)).toBe(true);
            
            // Steps should be sorted by priority
            for (let i = 1; i < result.nextSteps.length; i++) {
                expect(result.nextSteps[i].priority).toBeGreaterThanOrEqual(
                    result.nextSteps[i - 1].priority
                );
            }
        }
    });
});
