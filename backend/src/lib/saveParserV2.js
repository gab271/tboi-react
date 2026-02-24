/**
 * Isaac Repentance Save File Parser V2
 * Reescrito desde cero con:
 * - Decodificación BIT A BIT correcta
 * - Invariantes obligatorios
 * - Datasets versionados
 * - NUNCA fallback a demo
 */

const crypto = require('crypto');
const datasetLoader = require('../../data');

const PARSER_VERSION = '2.0.0';

// ═══════════════════════════════════════════════════════════════════════════
// ERROR CODES
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_CODES = {
    NO_FILE: { code: 'NO_FILE', http: 400, message: 'No se subió ningún archivo' },
    FILE_TOO_SMALL: { code: 'FILE_TOO_SMALL', http: 400, message: 'Archivo demasiado pequeño para ser un save válido' },
    FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', http: 400, message: 'Archivo demasiado grande' },
    EMPTY_FILE: { code: 'EMPTY_FILE', http: 400, message: 'El archivo está vacío' },
    EMPTY_SAVE: { code: 'EMPTY_SAVE', http: 422, message: 'El save está vacío (sin datos de progreso)' },
    BAD_HEADER: { code: 'BAD_HEADER', http: 422, message: 'Header inválido - no es un save de Isaac' },
    WRONG_VERSION: { code: 'WRONG_VERSION', http: 422, message: 'Versión del save no soportada' },
    PARSE_FAIL: { code: 'PARSE_FAIL', http: 422, message: 'Error al parsear el archivo' },
    CORRUPTED: { code: 'CORRUPTED', http: 422, message: 'El archivo parece estar corrupto' },
    INVARIANT_FAIL: { code: 'INVARIANT_FAIL', http: 422, message: 'Los datos parseados no pasan validación' },
    INTERNAL: { code: 'INTERNAL', http: 500, message: 'Error interno del servidor' }
};

// ═══════════════════════════════════════════════════════════════════════════
// BITFIELD DECODING - EL CORE DEL FIX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Decodifica un bitfield del buffer
 * CRÍTICO: Lee BIT A BIT, no byte a byte
 * 
 * @param {Buffer} buffer - El buffer del save
 * @param {number} offset - Offset en bytes donde empieza el bitfield
 * @param {number} nBits - Número total de bits a leer
 * @returns {number[]} Array de índices de bits que están en 1
 */
function decodeBitset(buffer, offset, nBits) {
    const setIndices = [];

    for (let bitIndex = 0; bitIndex < nBits; bitIndex++) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitPosition = bitIndex % 8;

        if (offset + byteIndex >= buffer.length) {
            // Buffer overflow - log pero continúa
            console.warn(`[decodeBitset] Buffer overflow at byte ${offset + byteIndex}, bit ${bitIndex}`);
            break;
        }

        const byte = buffer[offset + byteIndex];
        // LSB first (bit 0 es el menos significativo)
        const isSet = (byte & (1 << bitPosition)) !== 0;

        if (isSet) {
            setIndices.push(bitIndex);
        }
    }

    return setIndices;
}

/**
 * Cuenta bits en un rango del buffer (wrapper de decodeBitset)
 */
function countBitsInRange(buffer, offset, nBits) {
    return decodeBitset(buffer, offset, nBits).length;
}

/**
 * Lee un solo bit del buffer
 */
function readBit(buffer, byteOffset, bitIndex) {
    if (byteOffset >= buffer.length) return false;
    const byte = buffer[byteOffset];
    return (byte & (1 << bitIndex)) !== 0;
}

/**
 * Lee un byte como boolean (legacy compatibility)
 */
function readBool(buffer, offset) {
    if (offset >= buffer.length) return false;
    return buffer[offset] !== 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// PARSER CLASS
// ═══════════════════════════════════════════════════════════════════════════

class SaveParserV2 {
    constructor() {
        this.debug = process.env.NODE_ENV !== 'production';
    }

    /**
     * Parsea un buffer de save file
     * @param {Buffer} buffer - El buffer del archivo
     * @param {Object} options - Opciones (filename, etc.)
     * @returns {Object} Resultado del parsing
     */
    parse(buffer, options = {}) {
        const startTime = Date.now();

        try {
            // 1. Validación básica del buffer
            const validation = this._validateBuffer(buffer);
            if (!validation.valid) {
                return this._createError(validation.error, validation);
            }

            // 2. Extraer metadata
            const metadata = this._extractMetadata(buffer, options.filename);

            // 3. Detectar versión y cargar configuración
            const versionInfo = this._detectVersion(buffer);
            metadata.gameVersion = versionInfo.version;
            metadata.versionConfidence = versionInfo.confidence;

            let offsets, charDataset;
            try {
                offsets = datasetLoader.getOffsets(versionInfo.version);
                charDataset = datasetLoader.getCharacters(versionInfo.version);
            } catch (err) {
                console.error('[ParserV2] Failed to load datasets:', err);
                return this._createError('WRONG_VERSION', { message: err.message });
            }

            // 4. Parsear secciones
            const secrets = this._parseSecrets(buffer, offsets);
            const items = this._parseItems(buffer, offsets);
            const trinkets = this._parseTrinkets(buffer, offsets);
            const challenges = this._parseChallenges(buffer, offsets);
            const characters = this._parseCharacters(buffer, offsets, charDataset);
            const endings = this._deriveEndings(characters, offsets);

            // 5. Calcular totales
            const totalMarks = this._calculateTotalMarks(characters);
            const totalMarksExpected = charDataset.total * charDataset.totalMarksPerCharacter;

            // 6. Construir resultado
            const result = {
                ok: true,
                source: 'real', // CRÍTICO: Siempre 'real' si OK
                error_code: null,
                error_message: null,
                metadata: {
                    ...metadata,
                    parseTimeMs: Date.now() - startTime
                },
                endings,
                items,
                trinkets,
                characters,
                secrets,
                challenges,
                totalMarks,
                totalMarksExpected,
                sanityChecks: null,
                metrics: null
            };

            // 7. Validar invariantes
            result.sanityChecks = this._runInvariants(result);

            if (!result.sanityChecks.invariantsPassed) {
                // Log detallado pero continuar si solo hay warnings
                console.warn('[ParserV2] Invariant warnings:', result.sanityChecks);
                
                // Si hay errores críticos, fallar
                if (result.sanityChecks.errors.length > 0) {
                    return this._createError('INVARIANT_FAIL', {
                        errors: result.sanityChecks.errors,
                        warnings: result.sanityChecks.warnings
                    });
                }
            }

            // 8. Calcular métricas finales
            result.metrics = this._calculateMetrics(result);

            // 9. Generar missing breakdown y next steps
            result.missing = this._generateMissingBreakdown(result, charDataset);
            result.nextSteps = this._generateNextSteps(result.missing, characters);

            console.log('[ParserV2] Parse SUCCESS:', {
                fileHash: metadata.fileHash,
                deadGodPercentage: result.metrics.deadGodPercentage,
                secretsCount: secrets.count,
                totalMarks,
                parseTimeMs: result.metadata.parseTimeMs
            });

            return result;

        } catch (error) {
            console.error('[ParserV2] Critical error:', error);
            return this._createError('INTERNAL', {
                message: error.message,
                stack: this.debug ? error.stack : undefined
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    _validateBuffer(buffer) {
        if (!buffer) {
            return { valid: false, error: 'NO_FILE' };
        }

        if (buffer.length === 0) {
            return { valid: false, error: 'EMPTY_FILE' };
        }

        if (buffer.length < 1000) {
            return { valid: false, error: 'FILE_TOO_SMALL', size: buffer.length };
        }

        if (buffer.length > 100000) {
            return { valid: false, error: 'FILE_TOO_LARGE', size: buffer.length };
        }

        // Verificar que hay datos no-cero en secciones esperadas
        const hasData = buffer.slice(16, 300).some(b => b !== 0);
        if (!hasData) {
            return { valid: false, error: 'EMPTY_SAVE' };
        }

        return { valid: true };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // METADATA
    // ═══════════════════════════════════════════════════════════════════════

    _extractMetadata(buffer, filename) {
        return {
            gameVersion: 'unknown',
            versionConfidence: 'unknown',
            platform: this._detectPlatform(filename),
            slot: this._detectSlot(filename),
            fileHash: crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8),
            fileSize: buffer.length,
            parsedAt: new Date().toISOString(),
            parserVersion: PARSER_VERSION,
            headerHex: buffer.slice(0, 8).toString('hex')
        };
    }

    _detectSlot(filename) {
        if (!filename) return 1;
        const match = filename.match(/(\d)/);
        return match ? parseInt(match[1]) : 1;
    }

    _detectPlatform(filename) {
        if (!filename) return 'unknown';
        if (filename.includes('rep_')) return 'steam';
        return 'unknown';
    }

    _detectVersion(buffer) {
        const size = buffer.length;

        // Heurística basada en tamaño del archivo
        if (size > 25000) {
            return { version: 'repentance_plus', confidence: 'high' };
        }
        if (size > 18000) {
            return { version: 'repentance_plus', confidence: 'medium' };
        }
        if (size > 12000) {
            return { version: 'repentance_plus', confidence: 'low' };
        }

        return { version: 'repentance_plus', confidence: 'guess' };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION PARSERS
    // ═══════════════════════════════════════════════════════════════════════

    _parseSecrets(buffer, offsets) {
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
        const bits = decodeBitset(buffer, section.offset, section.bitsUsed);

        return {
            total: section.bitsUsed,
            collectedIds: bits,
            seenIds: bits, // En Repentance, collected = seen
            count: bits.length, // Consistent with secrets/trinkets
            countCollected: bits.length,
            countSeen: bits.length
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
            completedIds: bits.map(b => b + 1), // Challenges son 1-indexed en el juego
            count: bits.length
        };
    }

    _parseCharacters(buffer, offsets, charDataset) {
        const section = offsets.fileStructure.completionMarks;
        const characters = {};
        const markNames = charDataset.markNames.normal;

        for (let i = 0; i < charDataset.total; i++) {
            const charDef = charDataset.characters[i];
            const charOffset = section.offset + (i * section.perCharacterSize);

            // Estructura por personaje según offsets
            const struct = section.structure;

            // Leer normal marks como bitfield
            const normalBits = decodeBitset(buffer, charOffset + struct.normalMarks.relativeOffset, struct.normalMarks.bits);

            // Leer hard marks como bitfield
            const hardBits = decodeBitset(buffer, charOffset + struct.hardMarks.relativeOffset, struct.hardMarks.bits);

            // Leer greed marks como booleans individuales
            const greedCompleted = readBool(buffer, charOffset + struct.greedMark.relativeOffset);
            const greedierCompleted = readBool(buffer, charOffset + struct.greedierMark.relativeOffset);

            // Construir objetos de marks
            const normalMarks = {};
            const hardMarks = {};

            markNames.forEach((name, idx) => {
                normalMarks[name] = normalBits.includes(idx);
                hardMarks[name] = hardBits.includes(idx);
            });

            const greedMarks = charDef.hasGreed ? {
                ultraGreed: greedCompleted,
                ultraGreedier: greedierCompleted
            } : null;

            // Contar completados
            const normalCount = normalBits.length;
            const hardCount = hardBits.length;
            const greedCount = (greedCompleted ? 1 : 0) + (greedierCompleted ? 1 : 0);
            const completedCount = normalCount + hardCount + greedCount;

            // Total esperado
            const totalCount = charDef.hasGreed ? charDataset.totalMarksPerCharacter : 22;

            characters[i] = {
                id: i,
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
                totalMarks: totalCount,
                completedMarks: completedCount,
                percentage: Math.round((completedCount / totalCount) * 100)
            };
        }

        return characters;
    }

    _deriveEndings(characters, offsets) {
        /**
         * Los endings en Isaac se derivan de los bosses derrotados
         * NO hay una sección separada de endings en el save file
         * Esto corrige el bug de "endings > total"
         */
        const TOTAL_ENDINGS = offsets.totals.endings || 17;

        const endingConditions = [
            { id: 1, name: 'Mom', requires: (chars) => true }, // Siempre desbloqueado si hay save
            { id: 2, name: "Mom's Heart", requires: (chars) => this._anyCharHasMark(chars, 'momsHeart') },
            { id: 3, name: 'Isaac', requires: (chars) => this._anyCharHasMark(chars, 'isaac') },
            { id: 4, name: 'Satan', requires: (chars) => this._anyCharHasMark(chars, 'satan') },
            { id: 5, name: '???', requires: (chars) => this._anyCharHasMark(chars, 'blueBaby') },
            { id: 6, name: 'The Lamb', requires: (chars) => this._anyCharHasMark(chars, 'theLamb') },
            { id: 7, name: 'Boss Rush', requires: (chars) => this._anyCharHasMark(chars, 'bossRush') },
            { id: 8, name: 'Mega Satan', requires: (chars) => this._anyCharHasMark(chars, 'megaSatan') },
            { id: 9, name: 'Hush', requires: (chars) => this._anyCharHasMark(chars, 'hush') },
            { id: 10, name: 'Delirium', requires: (chars) => this._anyCharHasMark(chars, 'delirium') },
            { id: 11, name: 'Ultra Greed', requires: (chars) => this._anyCharHasGreed(chars, 'ultraGreed') },
            { id: 12, name: 'Ultra Greedier', requires: (chars) => this._anyCharHasGreed(chars, 'ultraGreedier') },
            { id: 13, name: 'Mega Satan (All)', requires: (chars) => this._countCharsWithMark(chars, 'megaSatan') >= 17 },
            { id: 14, name: 'Mother', requires: (chars) => this._anyCharHasMark(chars, 'mother') },
            { id: 15, name: 'The Beast', requires: (chars) => this._anyCharHasMark(chars, 'beast') },
            { id: 16, name: 'Epilogue', requires: (chars) => this._countEndings(chars) >= 10 },
            { id: 17, name: 'True Ending', requires: () => false } // Requiere Dead God completo
        ];

        const unlockedIds = endingConditions
            .filter(e => e.requires(characters))
            .map(e => e.id);

        return {
            total: TOTAL_ENDINGS,
            unlockedIds,
            count: Math.min(unlockedIds.length, TOTAL_ENDINGS), // NUNCA excede total
            details: endingConditions
                .filter(e => e.requires(characters))
                .map(e => ({ id: e.id, name: e.name }))
        };
    }

    // Helper methods para endings
    _anyCharHasMark(characters, markName) {
        return Object.values(characters).some(c =>
            c.marks.normal[markName] || c.marks.hard[markName]
        );
    }

    _anyCharHasGreed(characters, greedType) {
        return Object.values(characters).some(c =>
            c.marks.greed && c.marks.greed[greedType]
        );
    }

    _countCharsWithMark(characters, markName) {
        return Object.values(characters).filter(c =>
            c.marks.normal[markName] || c.marks.hard[markName]
        ).length;
    }

    _countEndings(characters) {
        // Cuenta endings básicos desbloqueados
        let count = 1; // Mom siempre
        const marks = ['momsHeart', 'isaac', 'satan', 'blueBaby', 'theLamb', 'bossRush', 'megaSatan', 'hush', 'delirium'];
        for (const mark of marks) {
            if (this._anyCharHasMark(characters, mark)) count++;
        }
        return count;
    }

    _calculateTotalMarks(characters) {
        return Object.values(characters).reduce((sum, c) => sum + c.completedMarks, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INVARIANTS
    // ═══════════════════════════════════════════════════════════════════════

    _runInvariants(data) {
        const warnings = [];
        const errors = [];

        // 1. Counts nunca exceden totales
        if (data.endings.count > data.endings.total) {
            errors.push(`endings.count (${data.endings.count}) > endings.total (${data.endings.total})`);
        }
        if (data.secrets.count > data.secrets.total) {
            errors.push(`secrets.count (${data.secrets.count}) > secrets.total (${data.secrets.total})`);
        }
        if (data.items.countCollected > data.items.total) {
            errors.push(`items.count (${data.items.countCollected}) > items.total (${data.items.total})`);
        }
        if (data.challenges.count > data.challenges.total) {
            errors.push(`challenges.count (${data.challenges.count}) > challenges.total (${data.challenges.total})`);
        }

        // 2. Counts nunca negativos
        if (data.endings.count < 0) errors.push('Negative endings count');
        if (data.secrets.count < 0) errors.push('Negative secrets count');
        if (data.items.countCollected < 0) errors.push('Negative items count');

        // 3. Marks nunca exceden total
        if (data.totalMarks > data.totalMarksExpected) {
            errors.push(`totalMarks (${data.totalMarks}) > expected (${data.totalMarksExpected})`);
        }

        // 4. Cross-validation: alto marks = alto secrets
        const marksPercent = (data.totalMarks / data.totalMarksExpected) * 100;
        const secretsPercent = (data.secrets.count / data.secrets.total) * 100;

        if (marksPercent > 80 && secretsPercent < 30) {
            warnings.push(`Unusual: ${marksPercent.toFixed(0)}% marks but only ${secretsPercent.toFixed(0)}% secrets`);
        }

        // 5. Bajo progreso con archivo grande = posible offset incorrecto
        if (data.metadata.fileSize > 25000 && secretsPercent < 5 && marksPercent < 5) {
            warnings.push('Large file but very low progress - possible offset mismatch');
        }

        return {
            warnings,
            errors,
            invariantsPassed: errors.length === 0
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // METRICS
    // ═══════════════════════════════════════════════════════════════════════

    _calculateMetrics(data) {
        // Dead God = 100% secrets (achievements)
        const secretsPercent = (data.secrets.count / data.secrets.total) * 100;

        const marksPercent = (data.totalMarks / data.totalMarksExpected) * 100;
        const itemsPercent = (data.items.countCollected / data.items.total) * 100;
        const challengesPercent = (data.challenges.count / data.challenges.total) * 100;

        return {
            // Primary metric - ESTO ES DEAD GOD
            deadGodPercentage: Math.round(secretsPercent * 100) / 100,
            isDeadGod: data.secrets.count >= data.secrets.total,

            // Secondary metrics
            secretsPercentage: Math.round(secretsPercent * 100) / 100,
            marksPercentage: Math.round(marksPercent * 100) / 100,
            itemsPercentage: Math.round(itemsPercent * 100) / 100,
            challengesPercentage: Math.round(challengesPercent * 100) / 100,

            // Counts for display
            secretsRemaining: data.secrets.total - data.secrets.count,
            marksRemaining: data.totalMarksExpected - data.totalMarks,

            // Tainted progress
            taintedProgress: this._calculateTaintedProgress(data.characters),

            // Estimated time (rough: 0.3h per missing secret on average)
            estimatedHoursRemaining: Math.round((data.secrets.total - data.secrets.count) * 0.3)
        };
    }

    _calculateTaintedProgress(characters) {
        const taintedChars = Object.values(characters).filter(c => c.isTainted);
        const totalTaintedMarks = taintedChars.reduce((sum, c) => sum + c.completedMarks, 0);
        const expectedTaintedMarks = taintedChars.reduce((sum, c) => sum + c.totalMarks, 0);

        return {
            percentage: Math.round((totalTaintedMarks / expectedTaintedMarks) * 100),
            completed: taintedChars.filter(c => c.completedMarks === c.totalMarks).length,
            total: taintedChars.length
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MISSING BREAKDOWN
    // ═══════════════════════════════════════════════════════════════════════

    _generateMissingBreakdown(data, charDataset) {
        // Marks faltantes por personaje
        const missingMarksByCharacter = [];

        for (const char of Object.values(data.characters)) {
            if (char.completedMarks >= char.totalMarks) continue;

            const missing = [];

            // Check normal marks
            for (const [mark, completed] of Object.entries(char.marks.normal)) {
                if (!completed) missing.push({ difficulty: 'normal', mark });
            }

            // Check hard marks
            for (const [mark, completed] of Object.entries(char.marks.hard)) {
                if (!completed) missing.push({ difficulty: 'hard', mark });
            }

            // Check greed marks
            if (char.marks.greed) {
                if (!char.marks.greed.ultraGreed) missing.push({ difficulty: 'greed', mark: 'ultraGreed' });
                if (!char.marks.greed.ultraGreedier) missing.push({ difficulty: 'greedier', mark: 'ultraGreedier' });
            }

            if (missing.length > 0) {
                missingMarksByCharacter.push({
                    characterId: char.id,
                    characterName: char.name,
                    isTainted: char.isTainted,
                    percentage: char.percentage,
                    missingMarks: missing,
                    count: missing.length
                });
            }
        }

        // Ordenar por % completado (más cercanos a terminar primero)
        missingMarksByCharacter.sort((a, b) => b.percentage - a.percentage);

        return {
            missingSecrets: {
                count: data.secrets.total - data.secrets.count
            },
            missingMarksByCharacter,
            missingItems: {
                count: data.items.total - data.items.countCollected
            },
            missingChallenges: {
                count: data.challenges.total - data.challenges.count
            },
            missingEndings: {
                count: data.endings.total - data.endings.count
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NEXT STEPS
    // ═══════════════════════════════════════════════════════════════════════

    _generateNextSteps(missing, characters) {
        const steps = [];

        // Prioridad 1: Personajes casi completos (≤3 marks faltantes)
        const almostDone = missing.missingMarksByCharacter
            .filter(c => c.count <= 3 && c.count > 0)
            .slice(0, 3);

        for (const char of almostDone) {
            const marksList = char.missingMarks
                .slice(0, 3)
                .map(m => `${m.mark} (${m.difficulty})`)
                .join(', ');

            steps.push({
                priority: 1,
                type: 'complete_character',
                title: `Completar ${char.characterName}`,
                description: `Solo ${char.count} marca(s): ${marksList}`,
                estimatedTime: `~${char.count * 30} min`,
                impact: 'high'
            });
        }

        // Prioridad 2: Challenges (si hay pendientes)
        if (missing.missingChallenges.count > 0 && missing.missingChallenges.count <= 10) {
            steps.push({
                priority: 2,
                type: 'challenges',
                title: `Completar challenges`,
                description: `${missing.missingChallenges.count} challenges pendientes`,
                estimatedTime: `~${missing.missingChallenges.count * 20} min`,
                impact: 'medium'
            });
        }

        // Prioridad 3: Items faltantes (si pocos)
        if (missing.missingItems.count > 0 && missing.missingItems.count < 50) {
            steps.push({
                priority: 3,
                type: 'items',
                title: `Recoger items faltantes`,
                description: `${missing.missingItems.count} items por encontrar`,
                estimatedTime: 'Variable',
                impact: 'medium'
            });
        }

        // Prioridad 4: Tainted characters no empezados
        const taintedNotStarted = missing.missingMarksByCharacter
            .filter(c => c.isTainted && c.percentage === 0);

        if (taintedNotStarted.length > 0) {
            steps.push({
                priority: 4,
                type: 'start_tainted',
                title: `Empezar Tainted characters`,
                description: `${taintedNotStarted.length} personajes Tainted sin progreso`,
                estimatedTime: `~${taintedNotStarted.length * 4}h (total)`,
                impact: 'high'
            });
        }

        return steps.sort((a, b) => a.priority - b.priority);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═══════════════════════════════════════════════════════════════════════

    _createError(errorType, details = {}) {
        const errorDef = ERROR_CODES[errorType] || ERROR_CODES.INTERNAL;

        console.error('[ParserV2] Error:', errorType, details);

        return {
            ok: false,
            source: 'error', // NUNCA 'demo'
            error_code: errorDef.code,
            error_message: errorDef.message,
            details,
            metadata: null,
            endings: null,
            items: null,
            characters: null,
            secrets: null,
            challenges: null,
            metrics: null,
            sanityChecks: null,
            missing: null,
            nextSteps: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const parserInstance = new SaveParserV2();

module.exports = {
    // Main parser
    parseSaveFile: (buffer, options) => parserInstance.parse(buffer, options),
    
    // Utilities
    decodeBitset,
    countBitsInRange,
    readBit,
    readBool,
    
    // Config
    PARSER_VERSION,
    ERROR_CODES,
    
    // Validation (for routes)
    validateSaveFile: (buffer) => parserInstance._validateBuffer(buffer),
    detectSlot: (filename) => parserInstance._detectSlot(filename)
};
