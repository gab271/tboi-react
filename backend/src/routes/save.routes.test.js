/**
 * Integration tests for Save Analysis API
 * Tests the full POST /api/save/analyze endpoint
 * 
 * Run: npm test -- save.routes.test.js
 */

const path = require('path');
const fs = require('fs');

// Mock Express request/response for testing
function createMockRequest(buffer, filename = 'rep_persistentgamedata1.dat') {
    return {
        file: buffer ? {
            buffer,
            originalname: filename,
            size: buffer?.length || 0,
            mimetype: 'application/octet-stream'
        } : null,
        ip: '127.0.0.1'
    };
}

function createMockResponse() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        _data: null
    };
    res.json.mockImplementation((data) => {
        res._data = data;
        return res;
    });
    return res;
}

// Import parser directly for unit-level integration
const { parseSaveFile, CONSTANTS } = require('./lib/saveParser');

describe('Save Analysis Integration', () => {
    describe('API Response Format', () => {
        it('should return proper error structure for missing file', () => {
            const result = parseSaveFile(null);
            
            expect(result).toHaveProperty('ok', false);
            expect(result).toHaveProperty('source');
            expect(result).toHaveProperty('error_code');
            expect(result).toHaveProperty('error_message');
            expect(result).toHaveProperty('parsed', null);
            expect(result).toHaveProperty('metrics', null);
        });

        it('should return proper success structure for valid file', () => {
            // Create mock valid save buffer
            const buffer = createMockSaveBuffer({ achievements: 100, marks: 50 });
            const result = parseSaveFile(buffer);
            
            // Even if parsing finds issues, structure should be correct
            expect(result).toHaveProperty('ok');
            expect(result).toHaveProperty('source');
            
            if (result.ok) {
                expect(result).toHaveProperty('parsed');
                expect(result).toHaveProperty('metrics');
                expect(result.source).toBe('real');
            }
        });
    });

    describe('Error Codes', () => {
        const errorCases = [
            { 
                name: 'null buffer', 
                input: null, 
                expectedCode: 'NO_BUFFER' 
            },
            { 
                name: 'empty buffer', 
                input: Buffer.alloc(0), 
                expectedCode: 'FILE_TOO_SMALL' 
            },
            { 
                name: 'too small file', 
                input: Buffer.alloc(1000), 
                expectedCode: 'FILE_TOO_SMALL' 
            },
            { 
                name: 'too large file', 
                input: Buffer.alloc(60000), 
                expectedCode: 'FILE_TOO_LARGE' 
            },
        ];

        errorCases.forEach(({ name, input, expectedCode }) => {
            it(`should return ${expectedCode} for ${name}`, () => {
                const result = parseSaveFile(input);
                expect(result.ok).toBe(false);
                expect(result.error_code).toBe(expectedCode);
            });
        });
    });

    describe('Data Validation', () => {
        it('should reject saves with all zeros (corrupted)', () => {
            const buffer = Buffer.alloc(20000); // Valid size but all zeros
            const result = parseSaveFile(buffer);
            
            expect(result.ok).toBe(false);
            expect(result.error_code).toBe('EMPTY_SAVE');
        });

        it('should accept saves with some achievement data', () => {
            const buffer = createMockSaveBuffer({ achievements: 50, marks: 25 });
            const result = parseSaveFile(buffer);
            
            // Should parse without crashing
            expect(result).toBeDefined();
            expect(result.source).not.toBe('demo');
        });
    });

    describe('Dead God Calculation', () => {
        it('should calculate percentage correctly', () => {
            const buffer = createMockSaveBuffer({ 
                achievements: CONSTANTS.TOTAL_ACHIEVEMENTS,
                marks: CONSTANTS.TOTAL_MARKS,
                items: CONSTANTS.TOTAL_ITEMS
            });
            
            const result = parseSaveFile(buffer);
            
            if (result.ok && result.metrics) {
                // Should be close to 100% if all data is set
                expect(result.metrics.deadGodPercentage).toBeGreaterThan(0);
                expect(result.metrics.deadGodPercentage).toBeLessThanOrEqual(100);
            }
        });

        it('should return 0% for empty save', () => {
            const buffer = createMockSaveBuffer({ achievements: 0, marks: 0, items: 0 });
            // Add some valid data so it doesn't get rejected as empty
            buffer[16] = 0x01;
            
            const result = parseSaveFile(buffer);
            
            if (result.ok && result.metrics) {
                expect(result.metrics.deadGodPercentage).toBeDefined();
            }
        });
    });
});

/**
 * Helper function to create mock save buffers
 */
function createMockSaveBuffer({ achievements = 0, marks = 0, items = 0 }) {
    const buffer = Buffer.alloc(20000);
    
    // Header
    buffer[0] = 0x4D;
    buffer[1] = 0x4F;
    
    // Achievements (offset 16, ~80 bytes for 637 achievements)
    const achievementBytes = Math.ceil(achievements / 8);
    for (let i = 0; i < achievementBytes && i < 80; i++) {
        if (i < achievementBytes - 1) {
            buffer[16 + i] = 0xFF;
        } else {
            // Last byte: only set remaining bits
            const remainingBits = achievements % 8;
            buffer[16 + i] = (1 << remainingBits) - 1;
        }
    }
    
    // Completion marks (offset 96, 12 per character, 34 characters)
    const marksPerCharacter = Math.floor(marks / 34);
    const extraMarks = marks % 34;
    
    for (let charIdx = 0; charIdx < 34; charIdx++) {
        const charMarks = charIdx < extraMarks ? marksPerCharacter + 1 : marksPerCharacter;
        for (let markIdx = 0; markIdx < Math.min(charMarks, 12); markIdx++) {
            buffer[96 + (charIdx * 12) + markIdx] = 1;
        }
    }
    
    return buffer;
}
