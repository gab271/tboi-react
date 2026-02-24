/**
 * Isaac Save Parser V3 - Comprehensive Test Suite
 * 
 * Tests cover:
 * - Bitfield decoding (LSB-first)
 * - Buffer validation
 * - Variant detection
 * - Invariant checking
 * - Hash verification
 * - Error handling (never returns demo data)
 */

const {
    parseSaveFile,
    decodeBitset,
    countBits,
    readBit,
    readBool,
    sha256,
    md5Short,
    validateSaveFile,
    detectSlot,
    detectVariant,
    PARSER_VERSION,
    ERROR_CODES
} = require('./saveParserV2');

// ═══════════════════════════════════════════════════════════════════════════
// TEST FIXTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a minimal valid-looking save file buffer
 * @param {Object} options - Configuration
 * @returns {Buffer}
 */
function createMockSaveBuffer(options = {}) {
    const {
        size = 25000,
        fillByte = 0x00,
        achievementBits = [],
        itemBits = []
    } = options;
    
    const buffer = Buffer.alloc(size, fillByte);
    
    // Add some non-zero data at offset 16 to pass validation
    buffer[16] = 0x01;
    buffer[20] = 0x01;
    buffer[100] = 0x01;
    
    // Set specific achievement bits
    for (const bitIdx of achievementBits) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitPos = bitIdx % 8;
        buffer[16 + byteIdx] |= (1 << bitPos);
    }
    
    // Set specific item bits (offset 912)
    for (const bitIdx of itemBits) {
        const byteIdx = Math.floor(bitIdx / 8);
        const bitPos = bitIdx % 8;
        buffer[912 + byteIdx] |= (1 << bitPos);
    }
    
    return buffer;
}

/**
 * Creates a buffer that should fail validation
 */
function createInvalidBuffer(type) {
    switch (type) {
        case 'too_small':
            return Buffer.alloc(500);
        case 'too_large':
            return Buffer.alloc(200000);
        case 'empty':
            return Buffer.alloc(0);
        case 'all_zeros':
            return Buffer.alloc(25000, 0x00);
        default:
            return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS: BITFIELD DECODING
// ═══════════════════════════════════════════════════════════════════════════

describe('decodeBitset', () => {
    test('decodes empty buffer correctly', () => {
        const buffer = Buffer.alloc(10, 0x00);
        const bits = decodeBitset(buffer, 0, 80);
        expect(bits).toEqual([]);
    });
    
    test('decodes single bit at position 0 (LSB)', () => {
        const buffer = Buffer.from([0x01]); // 0b00000001
        const bits = decodeBitset(buffer, 0, 8);
        expect(bits).toEqual([0]);
    });
    
    test('decodes single bit at position 7 (MSB)', () => {
        const buffer = Buffer.from([0x80]); // 0b10000000
        const bits = decodeBitset(buffer, 0, 8);
        expect(bits).toEqual([7]);
    });
    
    test('decodes multiple bits in same byte', () => {
        const buffer = Buffer.from([0x15]); // 0b00010101 = bits 0, 2, 4
        const bits = decodeBitset(buffer, 0, 8);
        expect(bits).toEqual([0, 2, 4]);
    });
    
    test('decodes bits across byte boundary', () => {
        const buffer = Buffer.from([0x80, 0x01]); // bit 7 and bit 8
        const bits = decodeBitset(buffer, 0, 16);
        expect(bits).toEqual([7, 8]);
    });
    
    test('decodes all bits set (0xFF)', () => {
        const buffer = Buffer.from([0xFF]);
        const bits = decodeBitset(buffer, 0, 8);
        expect(bits).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
    
    test('respects offset parameter', () => {
        const buffer = Buffer.from([0x00, 0x00, 0x05]); // zeros, then 0b00000101
        const bits = decodeBitset(buffer, 2, 8);
        expect(bits).toEqual([0, 2]);
    });
    
    test('respects nBits parameter (partial byte)', () => {
        const buffer = Buffer.from([0xFF]); // all bits set
        const bits = decodeBitset(buffer, 0, 4);
        expect(bits).toEqual([0, 1, 2, 3]); // only first 4 bits
    });
    
    test('handles buffer overflow gracefully', () => {
        const buffer = Buffer.from([0xFF]); // only 1 byte
        const bits = decodeBitset(buffer, 0, 100); // request 100 bits
        expect(bits).toEqual([0, 1, 2, 3, 4, 5, 6, 7]); // returns what it can
    });
    
    test('handles large bitfields (637 achievements)', () => {
        // Create buffer with bits 0, 100, 200, 300, 400, 500, 600 set
        const buffer = Buffer.alloc(80, 0x00);
        const targetBits = [0, 100, 200, 300, 400, 500, 600];
        
        for (const bitIdx of targetBits) {
            const byteIdx = Math.floor(bitIdx / 8);
            const bitPos = bitIdx % 8;
            buffer[byteIdx] |= (1 << bitPos);
        }
        
        const bits = decodeBitset(buffer, 0, 637);
        expect(bits).toEqual(targetBits);
    });
});

describe('countBits', () => {
    test('counts zero bits', () => {
        const buffer = Buffer.alloc(10, 0x00);
        expect(countBits(buffer, 0, 80)).toBe(0);
    });
    
    test('counts all bits in byte', () => {
        const buffer = Buffer.from([0xFF]);
        expect(countBits(buffer, 0, 8)).toBe(8);
    });
    
    test('counts sparse bits', () => {
        const buffer = Buffer.from([0x15]); // 3 bits set
        expect(countBits(buffer, 0, 8)).toBe(3);
    });
});

describe('readBit', () => {
    test('reads bit 0 correctly', () => {
        expect(readBit(Buffer.from([0x01]), 0, 0)).toBe(true);
        expect(readBit(Buffer.from([0x02]), 0, 0)).toBe(false);
    });
    
    test('reads bit 7 correctly', () => {
        expect(readBit(Buffer.from([0x80]), 0, 7)).toBe(true);
        expect(readBit(Buffer.from([0x7F]), 0, 7)).toBe(false);
    });
});

describe('readBool', () => {
    test('reads 0 as false', () => {
        expect(readBool(Buffer.from([0x00]), 0)).toBe(false);
    });
    
    test('reads non-zero as true', () => {
        expect(readBool(Buffer.from([0x01]), 0)).toBe(true);
        expect(readBool(Buffer.from([0xFF]), 0)).toBe(true);
    });
    
    test('handles out of bounds', () => {
        expect(readBool(Buffer.from([]), 0)).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS: HASH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

describe('sha256', () => {
    test('produces correct hash for known input', () => {
        const buffer = Buffer.from('hello');
        const hash = sha256(buffer);
        // SHA-256 of 'hello'
        expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
    
    test('produces different hashes for different inputs', () => {
        const hash1 = sha256(Buffer.from('hello'));
        const hash2 = sha256(Buffer.from('world'));
        expect(hash1).not.toBe(hash2);
    });
    
    test('is deterministic', () => {
        const buffer = Buffer.from('test');
        expect(sha256(buffer)).toBe(sha256(buffer));
    });
});

describe('md5Short', () => {
    test('returns 8-character hash', () => {
        const buffer = Buffer.from('test');
        const hash = md5Short(buffer);
        expect(hash.length).toBe(8);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// UNIT TESTS: VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

describe('validateSaveFile', () => {
    test('rejects null buffer', () => {
        const result = validateSaveFile(null);
        expect(result.ok).toBe(false);
        expect(result.errorCode).toBe('NO_FILE');
    });
    
    test('rejects empty buffer', () => {
        const result = validateSaveFile(createInvalidBuffer('empty'));
        expect(result.ok).toBe(false);
        expect(result.errorCode).toBe('EMPTY_FILE');
    });
    
    test('rejects too small buffer', () => {
        const result = validateSaveFile(createInvalidBuffer('too_small'));
        expect(result.ok).toBe(false);
        expect(result.errorCode).toBe('FILE_TOO_SMALL');
    });
    
    test('rejects too large buffer', () => {
        const result = validateSaveFile(createInvalidBuffer('too_large'));
        expect(result.ok).toBe(false);
        expect(result.errorCode).toBe('FILE_TOO_LARGE');
    });
    
    test('rejects buffer with no progress data', () => {
        const result = validateSaveFile(createInvalidBuffer('all_zeros'));
        expect(result.ok).toBe(false);
        expect(result.errorCode).toBe('EMPTY_SAVE');
    });
    
    test('accepts valid buffer', () => {
        const buffer = createMockSaveBuffer({ achievementBits: [0, 1, 2] });
        const result = validateSaveFile(buffer);
        expect(result.ok).toBe(true);
    });
});

describe('detectSlot', () => {
    test('detects slot 1 from filename', () => {
        expect(detectSlot('rep_persistentgamedata1.dat')).toBe(1);
    });
    
    test('detects slot 2 from filename', () => {
        expect(detectSlot('rep_persistentgamedata2.dat')).toBe(2);
    });
    
    test('detects slot 3 from filename', () => {
        expect(detectSlot('rep_persistentgamedata3.dat')).toBe(3);
    });
    
    test('defaults to slot 1 for unknown filename', () => {
        expect(detectSlot('unknown.dat')).toBe(1);
        expect(detectSlot(null)).toBe(1);
        expect(detectSlot('')).toBe(1);
    });
});

describe('detectVariant', () => {
    test('detects repentance_plus from filename', () => {
        const buffer = createMockSaveBuffer();
        const result = detectVariant(buffer, 'rep_persistentgamedata1.dat');
        expect(result.variant).toBe('repentance_plus');
        expect(result.supported).toBe(true);
    });
    
    test('detects vanilla as unsupported', () => {
        const buffer = createMockSaveBuffer({ size: 8000 });
        const result = detectVariant(buffer, 'persistentgamedata1.dat');
        expect(result.variant).toBe('vanilla');
        expect(result.supported).toBe(false);
    });
    
    test('uses file size heuristics', () => {
        const largeBuffer = createMockSaveBuffer({ size: 30000 });
        const result = detectVariant(largeBuffer, null);
        expect(result.variant).toBe('repentance_plus');
        expect(result.confidence).toBe('size_high');
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS: PARSE SAVE FILE
// ═══════════════════════════════════════════════════════════════════════════

describe('parseSaveFile', () => {
    test('returns error for null buffer, never demo', () => {
        const result = parseSaveFile(null);
        expect(result.ok).toBe(false);
        expect(result.source).toBe('error');
        expect(result.source).not.toBe('demo');
    });
    
    test('returns error for empty buffer, never demo', () => {
        const result = parseSaveFile(Buffer.alloc(0));
        expect(result.ok).toBe(false);
        expect(result.source).toBe('error');
    });
    
    test('returns error for too small buffer', () => {
        const result = parseSaveFile(Buffer.alloc(500, 0x01));
        expect(result.ok).toBe(false);
        expect(result.error_code).toBe('FILE_TOO_SMALL');
    });
    
    test('parses valid mock save buffer', () => {
        const buffer = createMockSaveBuffer({
            achievementBits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            itemBits: [0, 1, 2, 3, 4]
        });
        
        const result = parseSaveFile(buffer, { filename: 'rep_persistentgamedata1.dat' });
        
        expect(result.ok).toBe(true);
        expect(result.source).toBe('real');
        expect(result.secrets.count).toBeGreaterThanOrEqual(10);
        expect(result.items.collectedCount).toBeGreaterThanOrEqual(5);
    });
    
    test('includes valid metadata', () => {
        const buffer = createMockSaveBuffer();
        const result = parseSaveFile(buffer, { filename: 'rep_persistentgamedata2.dat' });
        
        if (result.ok) {
            expect(result.meta).toBeDefined();
            expect(result.meta.parserVersion).toBe(PARSER_VERSION);
            expect(result.meta.slot).toBe(2);
            expect(result.meta.sha256).toBeDefined();
            expect(result.meta.sha256.length).toBe(64);
        }
    });
    
    test('includes progress breakdown', () => {
        const buffer = createMockSaveBuffer({ achievementBits: [0, 1, 2] });
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.progress).toBeDefined();
            expect(result.progress.breakdown).toBeDefined();
            expect(result.progress.breakdown.achievements).toBeDefined();
            expect(result.progress.breakdown.achievements.count).toBeGreaterThanOrEqual(0);
            expect(result.progress.breakdown.achievements.total).toBe(637);
        }
    });
    
    test('never returns percentage > 100', () => {
        const buffer = createMockSaveBuffer();
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.progress.deadGodPercent).toBeLessThanOrEqual(100);
            expect(result.progress.deadGodPercent).toBeGreaterThanOrEqual(0);
        }
    });
    
    test('different buffers produce different hashes', () => {
        const buffer1 = createMockSaveBuffer({ achievementBits: [0] });
        const buffer2 = createMockSaveBuffer({ achievementBits: [1] });
        
        const result1 = parseSaveFile(buffer1);
        const result2 = parseSaveFile(buffer2);
        
        if (result1.ok && result2.ok) {
            expect(result1.meta.sha256).not.toBe(result2.meta.sha256);
        }
    });
    
    test('same buffer always produces same result', () => {
        const buffer = createMockSaveBuffer({ achievementBits: [0, 5, 10] });
        
        const result1 = parseSaveFile(buffer);
        const result2 = parseSaveFile(buffer);
        
        if (result1.ok && result2.ok) {
            expect(result1.meta.sha256).toBe(result2.meta.sha256);
            expect(result1.secrets.count).toBe(result2.secrets.count);
            expect(result1.items.collectedCount).toBe(result2.items.collectedCount);
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS: INVARIANTS
// ═══════════════════════════════════════════════════════════════════════════

describe('invariant checks', () => {
    test('endings never exceed total', () => {
        const buffer = createMockSaveBuffer();
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.endings.count).toBeLessThanOrEqual(result.endings.totalEndings);
        }
    });
    
    test('achievements never exceed total', () => {
        const buffer = createMockSaveBuffer({ achievementBits: [0, 100, 200, 300, 400, 500, 600] });
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.secrets.count).toBeLessThanOrEqual(result.secrets.total);
        }
    });
    
    test('items never exceed total', () => {
        const buffer = createMockSaveBuffer({ itemBits: [0, 100, 200, 300, 400, 500, 600] });
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            // V3 response uses items.totalItems and items.collectedCount
            expect(result.items.collectedCount).toBeLessThanOrEqual(result.items.totalItems);
        }
    });
    
    test('sanity checks are computed', () => {
        const buffer = createMockSaveBuffer();
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.sanity).toBeDefined();
            expect(result.sanity.computedChecks).toBeDefined();
            expect(typeof result.sanity.ok).toBe('boolean');
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CODE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('ERROR_CODES', () => {
    test('all error codes have code and message', () => {
        for (const [key, value] of Object.entries(ERROR_CODES)) {
            expect(value.code).toBeDefined();
            expect(value.message).toBeDefined();
            expect(value.http).toBeDefined();
        }
    });
    
    test('error codes are unique', () => {
        const codes = Object.values(ERROR_CODES).map(e => e.code);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(codes.length);
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('regression tests', () => {
    test('bug fix: parser never returns demo data on error', () => {
        // Test various error conditions to ensure 'demo' is never returned
        const testCases = [
            null,
            Buffer.alloc(0),
            Buffer.alloc(100),
            Buffer.alloc(500, 0x00),
            createInvalidBuffer('all_zeros')
        ];
        
        for (const buffer of testCases) {
            const result = parseSaveFile(buffer);
            expect(result.source).not.toBe('demo');
            if (!result.ok) {
                expect(result.source).toBe('error');
            }
        }
    });
    
    test('bug fix: percentage always clamped 0-100', () => {
        // Even if somehow achievements > total, percentage should be clamped
        const buffer = createMockSaveBuffer();
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.progress.deadGodPercent).toBeGreaterThanOrEqual(0);
            expect(result.progress.deadGodPercent).toBeLessThanOrEqual(100);
        }
    });
    
    test('bug fix: endings derived from marks, never exceeds total', () => {
        // Create buffer with many marks
        const buffer = createMockSaveBuffer({ achievementBits: Array.from({ length: 100 }, (_, i) => i) });
        const result = parseSaveFile(buffer);
        
        if (result.ok) {
            expect(result.endings.count).toBeLessThanOrEqual(17);
        }
    });
});
