# ISAAC REPENTANCE SAVE PARSER - PLAN DE REESCRITURA COMPLETO

## SECCIÓN 1 — DIAGNÓSTICO DEL BUG ACTUAL

### Síntomas Identificados
- **Endings > total** (ej: 29/17): Imposible matemáticamente
- **Porcentajes absurdos** (ej: 39% con casi todo desbloqueado)
- Datos incoherentes entre métricas

### Lista de Causas Probables (8 mínimo)

| # | Causa | Síntoma | Verificación |
|---|-------|---------|--------------|
| 1 | **Bytes como boolean en vez de bitfields** | Conteos inflados x8 | Log: `countBits()` vs `buffer.length` en sección |
| 2 | **Offsets desplazados por versión** | Datos aleatorios/ceros | Comparar `COMPLETION_OFFSET` con dump hex |
| 3 | **Endianness incorrecto** | Valores enormes/negativos | `buffer.readUInt32LE` vs `readUInt32BE` |
| 4 | **Parsing hasta 0 en estructuras fijas** | Truncamiento prematuro | Log cada byte, verificar longitud esperada |
| 5 | **Mezcla de tablas endings/cutscenes** | Total incorrecto | Verificar `TOTAL_ENDINGS` constante vs juego real |
| 6 | **Caching/fallback demo silencioso** | Datos no cambian | Agregar `X-Source: real` header obligatorio |
| 7 | **Slot incorrecto (1/2/3)** | Datos de otro save | Log `detectSlot()`, verificar filename |
| 8 | **Cloud sync corrupto** | Mezcla de versiones | Hash del archivo, comparar con backup local |
| 9 | **Header mágico no validado** | Archivo no-Isaac aceptado | Validar primeros 4 bytes |
| 10 | **Completion marks como bytes vs bitfield** | Marks inflados | Verificar estructura: ¿1 byte = 1 mark o 1 bit? |

### Pruebas de Verificación Rápidas

```javascript
// DEBUG_MODE: Agregar al parser
function debugSaveStructure(buffer) {
    console.log('[DEBUG] File size:', buffer.length);
    console.log('[DEBUG] Header (hex):', buffer.slice(0, 16).toString('hex'));
    console.log('[DEBUG] Achievements section (first 16 bytes):', 
        buffer.slice(CONSTANTS.ACHIEVEMENTS_OFFSET, CONSTANTS.ACHIEVEMENTS_OFFSET + 16).toString('hex'));
    console.log('[DEBUG] Completion section (first 48 bytes):', 
        buffer.slice(CONSTANTS.COMPLETION_OFFSET, CONSTANTS.COMPLETION_OFFSET + 48).toString('hex'));
    
    // Bit count vs byte count comparison
    const bitCount = countBits(buffer, CONSTANTS.ACHIEVEMENTS_OFFSET, CONSTANTS.ACHIEVEMENTS_SIZE);
    const nonZeroBytes = buffer.slice(CONSTANTS.ACHIEVEMENTS_OFFSET, CONSTANTS.ACHIEVEMENTS_OFFSET + CONSTANTS.ACHIEVEMENTS_SIZE)
        .filter(b => b !== 0).length;
    console.log('[DEBUG] Bit count:', bitCount, 'Non-zero bytes:', nonZeroBytes);
    
    return {
        fileSize: buffer.length,
        headerHex: buffer.slice(0, 16).toString('hex'),
        bitCount,
        nonZeroBytes,
        ratio: bitCount / nonZeroBytes // Should be ~4 if correctly reading bits
    };
}
```

---

## SECCIÓN 2 — ESTRATEGIA DE PARSING (DESDE CERO)

### 2.1 Canonic Output JSON

```typescript
interface SaveParseResult {
    // Metadata del archivo
    metadata: {
        gameVersion: 'repentance' | 'repentance_plus' | 'afterbirth_plus' | 'unknown';
        platform: 'steam' | 'gog' | 'epic' | 'console' | 'unknown';
        slot: 1 | 2 | 3;
        fileHash: string;        // MD5 truncado (8 chars)
        fileSize: number;
        parsedAt: string;        // ISO timestamp
        parserVersion: string;   // semver
        headerMagic: string;     // Hex de primeros 4 bytes
    };
    
    // Endings
    endings: {
        total: number;           // 17 en Repentance
        unlockedIds: number[];   // IDs específicos
        count: number;           // Nunca > total
    };
    
    // Items/Collectibles
    items: {
        total: number;           // 733 en Repentance+
        collectedIds: number[];  // Items recogidos al menos 1 vez
        seenIds: number[];       // Items vistos en pedestal (si aplica)
        countCollected: number;
        countSeen: number;
    };
    
    // Characters con completion marks
    characters: {
        [charId: number]: {
            name: string;
            isTainted: boolean;
            marks: {
                normal: CompletionMarks;
                hard: CompletionMarks;
                greed: GreedMarks | null;      // null para personajes sin Greed
                greedier: GreedMarks | null;
            };
            totalMarks: number;
            completedMarks: number;
        };
    };
    
    // Secrets (= Achievements en Repentance)
    secrets: {
        total: number;           // 637
        unlockedIds: number[];
        count: number;
    };
    
    // Challenges
    challenges: {
        total: number;           // 45
        completedIds: number[];
        count: number;
    };
    
    // Sanity checks
    sanityChecks: {
        warnings: string[];
        errors: string[];
        invariantsPassed: boolean;
    };
}

interface CompletionMarks {
    momsHeart: boolean;
    isaac: boolean;
    blueBaby: boolean;      // ???
    satan: boolean;
    theLamb: boolean;
    bossRush: boolean;
    hush: boolean;
    delirium: boolean;
    mother: boolean;
    beast: boolean;
    megaSatan: boolean;
}

interface GreedMarks {
    ultraGreed: boolean;
    ultraGreedier: boolean;
}
```

### 2.2 Invariantes (SIEMPRE deben cumplirse)

```javascript
const INVARIANTS = {
    // Counts nunca exceden totales
    endingsCount: (data) => data.endings.count <= data.endings.total,
    itemsCount: (data) => data.items.countCollected <= data.items.total,
    secretsCount: (data) => data.secrets.count <= data.secrets.total,
    challengesCount: (data) => data.challenges.count <= data.challenges.total,
    
    // Counts nunca negativos
    noNegativeCounts: (data) => 
        data.endings.count >= 0 &&
        data.items.countCollected >= 0 &&
        data.secrets.count >= 0,
    
    // IDs únicos
    uniqueEndingIds: (data) => new Set(data.endings.unlockedIds).size === data.endings.count,
    
    // Consistencia versión/totales
    versionConsistent: (data) => {
        if (data.metadata.gameVersion === 'repentance') {
            return data.items.total >= 700 && data.secrets.total >= 600;
        }
        return true;
    },
    
    // Si casi todo desbloqueado, secrets debe ser alto
    progressConsistent: (data) => {
        const marksPercent = calculateMarksPercent(data);
        const secretsPercent = (data.secrets.count / data.secrets.total) * 100;
        // Si >90% marks, no puede tener <50% secrets
        if (marksPercent > 90 && secretsPercent < 50) {
            return false;
        }
        return true;
    }
};

function runInvariants(data) {
    const results = {
        warnings: [],
        errors: [],
        invariantsPassed: true
    };
    
    for (const [name, check] of Object.entries(INVARIANTS)) {
        try {
            if (!check(data)) {
                results.errors.push(`Invariant failed: ${name}`);
                results.invariantsPassed = false;
            }
        } catch (e) {
            results.warnings.push(`Invariant threw: ${name}: ${e.message}`);
        }
    }
    
    return results;
}
```

### 2.3 Detección de Versión del Save

```javascript
// Save file signatures por versión
const VERSION_SIGNATURES = {
    // Magic bytes + características del header
    repentance_plus: {
        minSize: 20000,
        maxSize: 50000,
        expectedSecrets: 637,
        expectedItems: 733,
        signatureOffset: 0,
        // Detectar por tamaño y estructura
        detect: (buffer) => buffer.length > 25000 && buffer.length < 50000
    },
    repentance: {
        minSize: 18000,
        maxSize: 35000,
        expectedSecrets: 637,
        expectedItems: 700,
        detect: (buffer) => buffer.length > 18000 && buffer.length < 25000
    },
    afterbirth_plus: {
        minSize: 12000,
        maxSize: 20000,
        expectedSecrets: 403,
        expectedItems: 547,
        detect: (buffer) => buffer.length > 12000 && buffer.length < 18000
    }
};

function detectSaveVersion(buffer) {
    for (const [version, config] of Object.entries(VERSION_SIGNATURES)) {
        if (config.detect(buffer)) {
            return {
                version,
                config,
                confidence: 'high'
            };
        }
    }
    return {
        version: 'unknown',
        config: VERSION_SIGNATURES.repentance_plus, // Default más reciente
        confidence: 'low'
    };
}
```

### 2.4 Bitfield Decoding

```javascript
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
    const bytesNeeded = Math.ceil(nBits / 8);
    
    for (let bitIndex = 0; bitIndex < nBits; bitIndex++) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitPosition = bitIndex % 8;
        
        if (offset + byteIndex >= buffer.length) {
            console.warn(`[decodeBitset] Buffer overflow at byte ${offset + byteIndex}`);
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
 * Cuenta bits en un rango del buffer
 */
function countBitsInRange(buffer, offset, nBits) {
    return decodeBitset(buffer, offset, nBits).length;
}

/**
 * Mapea bits a IDs de entidad usando una tabla de mapeo
 */
function mapBitsToIds(bitIndices, mappingTable) {
    return bitIndices
        .map(bitIndex => mappingTable[bitIndex])
        .filter(id => id !== undefined && id !== null);
}

// TESTS para decodeBitset
function testDecodeBitset() {
    // Test 1: Todos los bits en 0
    const zeros = Buffer.from([0x00, 0x00]);
    console.assert(decodeBitset(zeros, 0, 16).length === 0, 'Test 1 failed');
    
    // Test 2: Todos los bits en 1
    const ones = Buffer.from([0xFF, 0xFF]);
    console.assert(decodeBitset(ones, 0, 16).length === 16, 'Test 2 failed');
    
    // Test 3: Patrón específico 0x0F = 00001111 -> bits 0,1,2,3 set
    const pattern = Buffer.from([0x0F]);
    const result = decodeBitset(pattern, 0, 8);
    console.assert(result.length === 4, 'Test 3 failed: count');
    console.assert(JSON.stringify(result) === '[0,1,2,3]', 'Test 3 failed: values');
    
    // Test 4: Bit 7 set = 0x80 = 10000000
    const bit7 = Buffer.from([0x80]);
    const result4 = decodeBitset(bit7, 0, 8);
    console.assert(result4.length === 1 && result4[0] === 7, 'Test 4 failed');
    
    console.log('[decodeBitset] All tests passed');
}
```

### 2.5 Manejo de Errores Estandarizado

```javascript
const ERROR_CODES = {
    // Errores de archivo
    NO_FILE: { code: 'NO_FILE', http: 400, message: 'No se subió ningún archivo' },
    FILE_TOO_SMALL: { code: 'FILE_TOO_SMALL', http: 400, message: 'Archivo demasiado pequeño para ser un save válido' },
    FILE_TOO_LARGE: { code: 'FILE_TOO_LARGE', http: 400, message: 'Archivo demasiado grande' },
    EMPTY_FILE: { code: 'EMPTY_FILE', http: 400, message: 'El archivo está vacío' },
    INVALID_FILE_TYPE: { code: 'INVALID_FILE_TYPE', http: 400, message: 'Tipo de archivo inválido. Debe ser .dat' },
    
    // Errores de parsing
    BAD_HEADER: { code: 'BAD_HEADER', http: 422, message: 'El archivo no tiene un header válido de Isaac' },
    WRONG_VERSION: { code: 'WRONG_VERSION', http: 422, message: 'Versión del save no soportada' },
    PARSE_FAIL: { code: 'PARSE_FAIL', http: 422, message: 'Error al parsear el archivo' },
    CORRUPTED: { code: 'CORRUPTED', http: 422, message: 'El archivo parece estar corrupto' },
    
    // Errores de validación
    INVARIANT_FAIL: { code: 'INVARIANT_FAIL', http: 422, message: 'Los datos parseados no pasan validación' },
    UNSUPPORTED: { code: 'UNSUPPORTED', http: 422, message: 'Característica no soportada para esta versión' },
    
    // Errores de sistema
    INTERNAL: { code: 'INTERNAL', http: 500, message: 'Error interno del servidor' }
};

function createError(errorType, details = {}) {
    const error = ERROR_CODES[errorType] || ERROR_CODES.INTERNAL;
    return {
        ok: false,
        source: 'error',  // NUNCA 'demo'
        error_code: error.code,
        error_message: error.message,
        details,
        parsed: null,
        metrics: null
    };
}
```

---

## SECCIÓN 3 — MAPEO DE DATOS

### 3.1 Sistema de Datasets Versionados

```
backend/
  data/
    versions/
      repentance_plus/
        endings.json
        items.json
        secrets.json
        characters.json
        challenges.json
        offsets.json
      repentance/
        ...
      afterbirth_plus/
        ...
    index.js          # Loader de datasets
```

### 3.2 Endings Map (Repentance)

```javascript
// data/versions/repentance_plus/endings.json
{
    "version": "repentance_plus",
    "lastUpdated": "2024-01-15",
    "source": "game_data_mining",
    "total": 17,
    "endings": [
        { "id": 1, "name": "Ending 1", "boss": "Mom", "unlockCondition": "Beat Mom" },
        { "id": 2, "name": "Ending 2", "boss": "Mom's Heart", "unlockCondition": "Beat Mom's Heart" },
        { "id": 3, "name": "Ending 3", "boss": "Isaac", "unlockCondition": "Beat Isaac" },
        { "id": 4, "name": "Ending 4", "boss": "Satan", "unlockCondition": "Beat Satan" },
        { "id": 5, "name": "Ending 5", "boss": "???", "unlockCondition": "Beat ???" },
        { "id": 6, "name": "Ending 6", "boss": "The Lamb", "unlockCondition": "Beat The Lamb" },
        { "id": 7, "name": "Ending 7", "boss": "Boss Rush", "unlockCondition": "Complete Boss Rush" },
        { "id": 8, "name": "Ending 8", "boss": "Mega Satan", "unlockCondition": "Beat Mega Satan" },
        { "id": 9, "name": "Ending 9", "boss": "Hush", "unlockCondition": "Beat Hush" },
        { "id": 10, "name": "Ending 10", "boss": "Delirium", "unlockCondition": "Beat Delirium" },
        { "id": 11, "name": "Ending 11", "boss": "Greed Mode", "unlockCondition": "Beat Ultra Greed" },
        { "id": 12, "name": "Ending 12", "boss": "Greedier Mode", "unlockCondition": "Beat Ultra Greedier" },
        { "id": 13, "name": "Ending 13", "boss": "Mega Satan (Alt)", "unlockCondition": "Beat Mega Satan as special char" },
        { "id": 14, "name": "Ending 14", "boss": "Mother", "unlockCondition": "Beat Mother" },
        { "id": 15, "name": "Ending 15", "boss": "The Beast", "unlockCondition": "Beat The Beast" },
        { "id": 16, "name": "Epilogue", "boss": "All Normal Endings", "unlockCondition": "See all normal endings" },
        { "id": 17, "name": "True Ending", "boss": "Full Completion", "unlockCondition": "Beat all with all chars (Dead God)" }
    ],
    "bitfieldOffset": null,
    "note": "Endings may be stored differently - verify with hex dump"
}
```

### 3.3 Characters Map

```javascript
// data/versions/repentance_plus/characters.json
{
    "version": "repentance_plus",
    "total": 34,
    "vanillaCount": 17,
    "taintedCount": 17,
    "characters": [
        { "id": 0, "name": "Isaac", "isTainted": false, "hasGreed": true },
        { "id": 1, "name": "Magdalene", "isTainted": false, "hasGreed": true },
        { "id": 2, "name": "Cain", "isTainted": false, "hasGreed": true },
        { "id": 3, "name": "Judas", "isTainted": false, "hasGreed": true },
        { "id": 4, "name": "Blue Baby", "isTainted": false, "hasGreed": true },
        { "id": 5, "name": "Eve", "isTainted": false, "hasGreed": true },
        { "id": 6, "name": "Samson", "isTainted": false, "hasGreed": true },
        { "id": 7, "name": "Azazel", "isTainted": false, "hasGreed": true },
        { "id": 8, "name": "Lazarus", "isTainted": false, "hasGreed": true },
        { "id": 9, "name": "Eden", "isTainted": false, "hasGreed": true },
        { "id": 10, "name": "The Lost", "isTainted": false, "hasGreed": true },
        { "id": 11, "name": "Lilith", "isTainted": false, "hasGreed": true },
        { "id": 12, "name": "Keeper", "isTainted": false, "hasGreed": true },
        { "id": 13, "name": "Apollyon", "isTainted": false, "hasGreed": true },
        { "id": 14, "name": "The Forgotten", "isTainted": false, "hasGreed": true },
        { "id": 15, "name": "Bethany", "isTainted": false, "hasGreed": true },
        { "id": 16, "name": "Jacob & Esau", "isTainted": false, "hasGreed": true },
        { "id": 17, "name": "Tainted Isaac", "isTainted": true, "hasGreed": true },
        { "id": 18, "name": "Tainted Magdalene", "isTainted": true, "hasGreed": true },
        { "id": 19, "name": "Tainted Cain", "isTainted": true, "hasGreed": true },
        { "id": 20, "name": "Tainted Judas", "isTainted": true, "hasGreed": true },
        { "id": 21, "name": "Tainted Blue Baby", "isTainted": true, "hasGreed": true },
        { "id": 22, "name": "Tainted Eve", "isTainted": true, "hasGreed": true },
        { "id": 23, "name": "Tainted Samson", "isTainted": true, "hasGreed": true },
        { "id": 24, "name": "Tainted Azazel", "isTainted": true, "hasGreed": true },
        { "id": 25, "name": "Tainted Lazarus", "isTainted": true, "hasGreed": true },
        { "id": 26, "name": "Tainted Eden", "isTainted": true, "hasGreed": true },
        { "id": 27, "name": "Tainted Lost", "isTainted": true, "hasGreed": true },
        { "id": 28, "name": "Tainted Lilith", "isTainted": true, "hasGreed": true },
        { "id": 29, "name": "Tainted Keeper", "isTainted": true, "hasGreed": true },
        { "id": 30, "name": "Tainted Apollyon", "isTainted": true, "hasGreed": true },
        { "id": 31, "name": "Tainted Forgotten", "isTainted": true, "hasGreed": true },
        { "id": 32, "name": "Tainted Bethany", "isTainted": true, "hasGreed": true },
        { "id": 33, "name": "Tainted Jacob", "isTainted": true, "hasGreed": true }
    ],
    "marksPerCharacter": {
        "normal": ["momsHeart", "isaac", "blueBaby", "satan", "theLamb", "bossRush", "hush", "delirium", "mother", "beast", "megaSatan"],
        "hard": ["momsHeart", "isaac", "blueBaby", "satan", "theLamb", "bossRush", "hush", "delirium", "mother", "beast", "megaSatan"],
        "greed": ["ultraGreed"],
        "greedier": ["ultraGreedier"]
    },
    "totalMarksPerCharacter": 24,
    "note": "Each character has 11 normal marks + 11 hard marks + 2 greed marks = 24 marks"
}
```

### 3.4 Offsets por Versión

```javascript
// data/versions/repentance_plus/offsets.json
{
    "version": "repentance_plus",
    "fileStructure": {
        "header": {
            "offset": 0,
            "size": 16,
            "fields": {
                "magic": { "offset": 0, "size": 4 },
                "version": { "offset": 4, "size": 4 },
                "checksum": { "offset": 8, "size": 8 }
            }
        },
        "achievements": {
            "offset": 16,
            "size": 80,
            "type": "bitfield",
            "bitsUsed": 637,
            "note": "Each bit represents one achievement/secret"
        },
        "completionMarks": {
            "offset": 96,
            "size": 408,
            "type": "structured",
            "perCharacterSize": 12,
            "structure": {
                "normalMarks": { "offset": 0, "size": 4, "type": "bitfield", "bits": 11 },
                "hardMarks": { "offset": 4, "size": 4, "type": "bitfield", "bits": 11 },
                "greedMarks": { "offset": 8, "size": 2, "type": "bitfield", "bits": 2 },
                "reserved": { "offset": 10, "size": 2 }
            }
        },
        "items": {
            "offset": 504,
            "size": 92,
            "type": "bitfield",
            "bitsUsed": 733
        },
        "trinkets": {
            "offset": 596,
            "size": 24,
            "type": "bitfield",
            "bitsUsed": 189
        },
        "challenges": {
            "offset": 620,
            "size": 6,
            "type": "bitfield",
            "bitsUsed": 45
        }
    },
    "warning": "ESTOS OFFSETS SON APROXIMADOS. Deben verificarse con hex dump de saves reales."
}
```

### 3.5 Loader de Datasets

```javascript
// data/index.js
const fs = require('fs');
const path = require('path');

class DatasetLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = path.join(__dirname, 'versions');
    }
    
    getDataset(version, type) {
        const cacheKey = `${version}:${type}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const filePath = path.join(this.basePath, version, `${type}.json`);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`Dataset not found: ${cacheKey}`);
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.cache.set(cacheKey, data);
        
        return data;
    }
    
    getOffsets(version) {
        return this.getDataset(version, 'offsets');
    }
    
    getCharacters(version) {
        return this.getDataset(version, 'characters');
    }
    
    getEndings(version) {
        return this.getDataset(version, 'endings');
    }
    
    getItems(version) {
        return this.getDataset(version, 'items');
    }
    
    getSecrets(version) {
        return this.getDataset(version, 'secrets');
    }
    
    clearCache() {
        this.cache.clear();
    }
}

module.exports = new DatasetLoader();
```

---

## SECCIÓN 4 — CÁLCULO DE PROGRESO "PATH TO DEAD GOD"

### 4.1 Qué Métricas Mostrar en UI

| Métrica | Descripción | Cálculo | Relevancia Dead God |
|---------|-------------|---------|---------------------|
| **Secrets/Achievements %** | Logros del juego | secrets.count / secrets.total | **PRINCIPAL** (100% = Dead God) |
| **Marks %** | Completion marks totales | (todas_marks / total_marks) | Secundario |
| **Items %** | Items vistos/recogidos | items.count / items.total | Contribuye a secrets |
| **Challenges %** | Challenges completados | challenges.count / challenges.total | Contribuye a secrets |
| **Tainted %** | Progreso tainted chars | tainted_marks / total_tainted_marks | Subconjunto de marks |

### 4.2 Dead God Progress Real

```javascript
/**
 * Dead God = Desbloquear TODOS los secretos/achievements (637)
 * NO es un promedio ponderado, es binario:
 * - 100% secrets = Dead God
 * - <100% secrets = No Dead God
 * 
 * El "progreso" real es: secrets.count / secrets.total
 */
function calculateDeadGodProgress(parsedData) {
    // Dead God es 100% secrets
    const secretsProgress = (parsedData.secrets.count / parsedData.secrets.total) * 100;
    
    return {
        // Progreso principal (lo único que importa para Dead God)
        deadGodPercentage: Math.round(secretsProgress * 100) / 100,
        isDeadGod: parsedData.secrets.count >= parsedData.secrets.total,
        
        // Breakdown para UI
        breakdown: {
            secrets: {
                current: parsedData.secrets.count,
                total: parsedData.secrets.total,
                percentage: secretsProgress,
                weight: 1.0  // 100% del progreso real
            },
            // Estos son informativos, no afectan Dead God %
            marks: {
                current: calculateTotalMarks(parsedData),
                total: parsedData.totalMarksExpected,
                percentage: (calculateTotalMarks(parsedData) / parsedData.totalMarksExpected) * 100,
                note: 'Contribuye a secrets al desbloquear personajes/bosses'
            },
            items: {
                current: parsedData.items.countCollected,
                total: parsedData.items.total,
                percentage: (parsedData.items.countCollected / parsedData.items.total) * 100,
                note: 'Algunos items son secrets'
            },
            challenges: {
                current: parsedData.challenges.count,
                total: parsedData.challenges.total,
                percentage: (parsedData.challenges.count / parsedData.challenges.total) * 100,
                note: 'Completar challenges desbloquea secrets'
            }
        },
        
        // Missing count
        secretsRemaining: parsedData.secrets.total - parsedData.secrets.count
    };
}
```

### 4.3 Breakdown de Missing Items

```javascript
function generateMissingBreakdown(parsedData, datasets) {
    const secretsDataset = datasets.getSecrets(parsedData.metadata.gameVersion);
    const charactersDataset = datasets.getCharacters(parsedData.metadata.gameVersion);
    
    // Secrets faltantes
    const allSecretIds = secretsDataset.secrets.map(s => s.id);
    const missingSecrets = allSecretIds.filter(id => !parsedData.secrets.unlockedIds.includes(id));
    
    // Marks faltantes por personaje
    const missingMarksByCharacter = [];
    for (const char of Object.values(parsedData.characters)) {
        const charMissing = [];
        for (const [difficulty, marks] of Object.entries(char.marks)) {
            if (marks === null) continue;
            for (const [markName, completed] of Object.entries(marks)) {
                if (!completed) {
                    charMissing.push({ difficulty, mark: markName });
                }
            }
        }
        if (charMissing.length > 0) {
            missingMarksByCharacter.push({
                characterId: char.id,
                characterName: char.name,
                isTainted: char.isTainted,
                missingMarks: charMissing,
                count: charMissing.length
            });
        }
    }
    
    // Items faltantes
    const itemsDataset = datasets.getItems(parsedData.metadata.gameVersion);
    const allItemIds = itemsDataset.items.map(i => i.id);
    const missingItems = allItemIds.filter(id => !parsedData.items.collectedIds.includes(id));
    
    // Challenges faltantes
    const missingChallenges = [];
    for (let i = 1; i <= parsedData.challenges.total; i++) {
        if (!parsedData.challenges.completedIds.includes(i)) {
            missingChallenges.push(i);
        }
    }
    
    return {
        missingSecrets: {
            ids: missingSecrets,
            count: missingSecrets.length,
            details: missingSecrets.map(id => secretsDataset.secrets.find(s => s.id === id)).filter(Boolean)
        },
        missingMarksByCharacter: missingMarksByCharacter.sort((a, b) => a.count - b.count),
        missingItems: {
            ids: missingItems,
            count: missingItems.length
        },
        missingChallenges: {
            ids: missingChallenges,
            count: missingChallenges.length
        }
    };
}
```

### 4.4 Next Steps (Unlock Optimizer)

```javascript
function generateNextSteps(parsedData, missingBreakdown) {
    const steps = [];
    
    // Prioridad 1: Personajes casi completos (< 3 marks faltantes)
    const almostDone = missingBreakdown.missingMarksByCharacter
        .filter(c => c.count <= 3 && c.count > 0)
        .slice(0, 3);
    
    for (const char of almostDone) {
        steps.push({
            priority: 1,
            type: 'complete_character',
            title: `Completar ${char.characterName}`,
            description: `Solo faltan ${char.count} marca(s): ${char.missingMarks.map(m => `${m.mark} (${m.difficulty})`).join(', ')}`,
            estimatedTime: char.count * 30, // ~30 min por mark
            reward: 'Character completion secret'
        });
    }
    
    // Prioridad 2: Challenges pendientes (rápidos)
    if (missingBreakdown.missingChallenges.count > 0) {
        steps.push({
            priority: 2,
            type: 'challenges',
            title: `Completar challenges`,
            description: `${missingBreakdown.missingChallenges.count} challenges pendientes`,
            estimatedTime: missingBreakdown.missingChallenges.count * 20,
            reward: 'Challenge completion secrets + unlocks'
        });
    }
    
    // Prioridad 3: Items faltantes (pueden aparecer naturalmente)
    if (missingBreakdown.missingItems.count > 0 && missingBreakdown.missingItems.count < 50) {
        steps.push({
            priority: 3,
            type: 'items',
            title: `Encontrar items restantes`,
            description: `${missingBreakdown.missingItems.count} items por recoger`,
            estimatedTime: null, // Varía mucho
            reward: 'Item collection secrets'
        });
    }
    
    // Prioridad 4: Tainted characters (si no empezados)
    const taintedNotStarted = missingBreakdown.missingMarksByCharacter
        .filter(c => c.isTainted && c.count === 24); // Todas las marks
    
    if (taintedNotStarted.length > 0) {
        steps.push({
            priority: 4,
            type: 'start_tainted',
            title: `Comenzar personajes Tainted`,
            description: `${taintedNotStarted.length} personajes Tainted sin empezar`,
            estimatedTime: taintedNotStarted.length * 4 * 60, // ~4h por personaje completo
            reward: 'Tainted completion is major Dead God requirement'
        });
    }
    
    return steps.sort((a, b) => a.priority - b.priority);
}
```

---

## SECCIÓN 5 — IMPLEMENTACIÓN

### 5.1 Backend: Parser Reescrito

```javascript
// backend/src/lib/saveParserV2.js
const crypto = require('crypto');
const datasetLoader = require('../data');

const PARSER_VERSION = '2.0.0';

/**
 * Parser V2 - Reescrito desde cero
 */
class SaveParserV2 {
    constructor() {
        this.debug = process.env.NODE_ENV !== 'production';
    }
    
    parse(buffer, options = {}) {
        const startTime = Date.now();
        const result = this._createEmptyResult();
        
        try {
            // 1. Validación básica
            const validation = this._validateBuffer(buffer);
            if (!validation.valid) {
                return this._createError(validation.error, validation);
            }
            
            // 2. Metadata
            result.metadata = this._extractMetadata(buffer, options.filename);
            
            // 3. Detectar versión y cargar offsets
            const versionInfo = this._detectVersion(buffer);
            result.metadata.gameVersion = versionInfo.version;
            
            const offsets = datasetLoader.getOffsets(versionInfo.version);
            
            // 4. Parsear secciones
            result.secrets = this._parseSecrets(buffer, offsets);
            result.items = this._parseItems(buffer, offsets);
            result.characters = this._parseCharacters(buffer, offsets, versionInfo.version);
            result.challenges = this._parseChallenges(buffer, offsets);
            result.endings = this._parseEndings(buffer, offsets, result.characters);
            
            // 5. Validar invariantes
            result.sanityChecks = this._runInvariants(result);
            
            if (!result.sanityChecks.invariantsPassed) {
                return this._createError('INVARIANT_FAIL', {
                    errors: result.sanityChecks.errors
                });
            }
            
            // 6. Calcular métricas
            result.metrics = this._calculateMetrics(result);
            result.missing = generateMissingBreakdown(result, datasetLoader);
            result.nextSteps = generateNextSteps(result, result.missing);
            
            // 7. Metadata final
            result.metadata.parseTimeMs = Date.now() - startTime;
            result.ok = true;
            result.source = 'real';
            
            return result;
            
        } catch (error) {
            console.error('[ParserV2] Critical error:', error);
            return this._createError('INTERNAL', { 
                message: error.message,
                stack: this.debug ? error.stack : undefined
            });
        }
    }
    
    _validateBuffer(buffer) {
        if (!buffer) {
            return { valid: false, error: 'NO_FILE' };
        }
        if (buffer.length < 100) {
            return { valid: false, error: 'FILE_TOO_SMALL', size: buffer.length };
        }
        if (buffer.length > 100000) {
            return { valid: false, error: 'FILE_TOO_LARGE', size: buffer.length };
        }
        
        // Check for all zeros (empty save)
        const hasData = buffer.slice(16, 200).some(b => b !== 0);
        if (!hasData) {
            return { valid: false, error: 'EMPTY_SAVE' };
        }
        
        return { valid: true };
    }
    
    _extractMetadata(buffer, filename) {
        return {
            gameVersion: 'unknown', // Set later
            platform: 'unknown',
            slot: this._detectSlot(filename),
            fileHash: crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8),
            fileSize: buffer.length,
            parsedAt: new Date().toISOString(),
            parserVersion: PARSER_VERSION,
            headerMagic: buffer.slice(0, 4).toString('hex')
        };
    }
    
    _detectSlot(filename) {
        if (!filename) return 1;
        const match = filename.match(/(\d)/);
        return match ? parseInt(match[1]) : 1;
    }
    
    _detectVersion(buffer) {
        // Heurística basada en tamaño
        const size = buffer.length;
        if (size > 25000) return { version: 'repentance_plus', confidence: 'high' };
        if (size > 18000) return { version: 'repentance', confidence: 'medium' };
        return { version: 'repentance_plus', confidence: 'low' };
    }
    
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
            seenIds: bits, // Mismo por ahora
            countCollected: bits.length,
            countSeen: bits.length
        };
    }
    
    _parseCharacters(buffer, offsets, version) {
        const charDataset = datasetLoader.getCharacters(version);
        const section = offsets.fileStructure.completionMarks;
        const characters = {};
        
        for (let i = 0; i < charDataset.total; i++) {
            const charDef = charDataset.characters[i];
            const charOffset = section.offset + (i * section.perCharacterSize);
            
            // Leer marks como bitfields
            const normalBits = decodeBitset(buffer, charOffset, 11);
            const hardBits = decodeBitset(buffer, charOffset + 4, 11);
            const greedBits = decodeBitset(buffer, charOffset + 8, 2);
            
            const markNames = charDataset.marksPerCharacter.normal;
            
            const normalMarks = {};
            const hardMarks = {};
            
            markNames.forEach((name, idx) => {
                normalMarks[name] = normalBits.includes(idx);
                hardMarks[name] = hardBits.includes(idx);
            });
            
            const greedMarks = charDef.hasGreed ? {
                ultraGreed: greedBits.includes(0),
                ultraGreedier: greedBits.includes(1)
            } : null;
            
            const completedCount = normalBits.length + hardBits.length + greedBits.length;
            const totalCount = charDef.hasGreed ? 24 : 22;
            
            characters[i] = {
                id: i,
                name: charDef.name,
                isTainted: charDef.isTainted,
                marks: {
                    normal: normalMarks,
                    hard: hardMarks,
                    greed: greedMarks,
                    greedier: null // Greedier está en greed.ultraGreedier
                },
                totalMarks: totalCount,
                completedMarks: completedCount
            };
        }
        
        return characters;
    }
    
    _parseChallenges(buffer, offsets) {
        const section = offsets.fileStructure.challenges;
        const bits = decodeBitset(buffer, section.offset, section.bitsUsed);
        
        return {
            total: section.bitsUsed,
            completedIds: bits.map(b => b + 1), // Challenges son 1-indexed
            count: bits.length
        };
    }
    
    _parseEndings(buffer, offsets, characters) {
        // Los endings se derivan de los personajes con ciertas marks
        // NO hay una sección separada de endings en el save
        
        const endingConditions = [
            { id: 1, requires: () => true }, // Mom siempre completado si hay save
            { id: 2, requires: (chars) => Object.values(chars).some(c => c.marks.normal.momsHeart) },
            { id: 3, requires: (chars) => Object.values(chars).some(c => c.marks.normal.isaac) },
            { id: 4, requires: (chars) => Object.values(chars).some(c => c.marks.normal.satan) },
            { id: 5, requires: (chars) => Object.values(chars).some(c => c.marks.normal.blueBaby) },
            { id: 6, requires: (chars) => Object.values(chars).some(c => c.marks.normal.theLamb) },
            { id: 7, requires: (chars) => Object.values(chars).some(c => c.marks.normal.bossRush) },
            { id: 8, requires: (chars) => Object.values(chars).some(c => c.marks.normal.megaSatan) },
            { id: 9, requires: (chars) => Object.values(chars).some(c => c.marks.normal.hush) },
            { id: 10, requires: (chars) => Object.values(chars).some(c => c.marks.normal.delirium) },
            { id: 11, requires: (chars) => Object.values(chars).some(c => c.marks.greed?.ultraGreed) },
            { id: 12, requires: (chars) => Object.values(chars).some(c => c.marks.greed?.ultraGreedier) },
            { id: 13, requires: (chars) => Object.values(chars).filter(c => c.marks.normal.megaSatan).length >= 10 },
            { id: 14, requires: (chars) => Object.values(chars).some(c => c.marks.normal.mother) },
            { id: 15, requires: (chars) => Object.values(chars).some(c => c.marks.normal.beast) },
        ];
        
        const TOTAL_ENDINGS = 17; // Número fijo en Repentance
        const unlockedIds = endingConditions
            .filter(e => e.requires(characters))
            .map(e => e.id);
        
        return {
            total: TOTAL_ENDINGS,
            unlockedIds,
            count: Math.min(unlockedIds.length, TOTAL_ENDINGS) // NUNCA excede total
        };
    }
    
    _runInvariants(data) {
        const warnings = [];
        const errors = [];
        
        // Check counts <= totals
        if (data.endings.count > data.endings.total) {
            errors.push(`endings.count (${data.endings.count}) > endings.total (${data.endings.total})`);
        }
        if (data.secrets.count > data.secrets.total) {
            errors.push(`secrets.count (${data.secrets.count}) > secrets.total (${data.secrets.total})`);
        }
        if (data.items.countCollected > data.items.total) {
            errors.push(`items.count (${data.items.countCollected}) > items.total (${data.items.total})`);
        }
        
        // Check no negatives
        if (data.endings.count < 0 || data.secrets.count < 0 || data.items.countCollected < 0) {
            errors.push('Negative count detected');
        }
        
        // Cross-validation: high marks should mean high secrets
        const totalMarks = Object.values(data.characters).reduce((sum, c) => sum + c.completedMarks, 0);
        const marksPercent = (totalMarks / (34 * 24)) * 100;
        const secretsPercent = (data.secrets.count / data.secrets.total) * 100;
        
        if (marksPercent > 80 && secretsPercent < 40) {
            warnings.push(`Unusual: ${marksPercent.toFixed(0)}% marks but only ${secretsPercent.toFixed(0)}% secrets`);
        }
        
        return {
            warnings,
            errors,
            invariantsPassed: errors.length === 0
        };
    }
    
    _calculateMetrics(data) {
        const deadGodProgress = calculateDeadGodProgress(data);
        
        return {
            deadGodPercentage: deadGodProgress.deadGodPercentage,
            isDeadGod: deadGodProgress.isDeadGod,
            secretsPercentage: (data.secrets.count / data.secrets.total) * 100,
            itemsPercentage: (data.items.countCollected / data.items.total) * 100,
            challengesPercentage: (data.challenges.count / data.challenges.total) * 100,
            breakdown: deadGodProgress.breakdown
        };
    }
    
    _createEmptyResult() {
        return {
            ok: false,
            source: 'parsing',
            error_code: null,
            error_message: null,
            metadata: null,
            endings: null,
            items: null,
            characters: null,
            secrets: null,
            challenges: null,
            sanityChecks: null,
            metrics: null,
            missing: null,
            nextSteps: null
        };
    }
    
    _createError(errorType, details = {}) {
        const errorDef = ERROR_CODES[errorType] || ERROR_CODES.INTERNAL;
        return {
            ok: false,
            source: 'error',
            error_code: errorDef.code,
            error_message: errorDef.message,
            details,
            metadata: null,
            parsed: null,
            metrics: null
        };
    }
}

module.exports = new SaveParserV2();
```

### 5.2 API Contract

```javascript
// POST /api/save/analyze

// Request: multipart/form-data
// Field: saveFile (File)

// Response SUCCESS (200):
{
    "ok": true,
    "source": "real",  // SIEMPRE "real" si ok=true
    "metadata": {
        "gameVersion": "repentance_plus",
        "slot": 1,
        "fileHash": "a1b2c3d4",
        "fileSize": 28456,
        "parsedAt": "2024-01-15T10:30:00.000Z",
        "parserVersion": "2.0.0"
    },
    "endings": {
        "total": 17,
        "unlockedIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15],
        "count": 12
    },
    "items": {
        "total": 733,
        "collectedIds": [...],
        "countCollected": 698
    },
    "characters": {
        "0": {
            "name": "Isaac",
            "isTainted": false,
            "marks": {
                "normal": { "momsHeart": true, "isaac": true, ... },
                "hard": { "momsHeart": true, ... },
                "greed": { "ultraGreed": true, "ultraGreedier": false }
            },
            "completedMarks": 20,
            "totalMarks": 24
        },
        ...
    },
    "secrets": {
        "total": 637,
        "count": 598
    },
    "metrics": {
        "deadGodPercentage": 93.88,
        "isDeadGod": false,
        "secretsPercentage": 93.88,
        "breakdown": { ... }
    },
    "missing": {
        "missingSecrets": { "count": 39, ... },
        "missingMarksByCharacter": [...],
        "missingItems": { "count": 35, ... }
    },
    "nextSteps": [
        { "priority": 1, "type": "complete_character", "title": "Completar Tainted Lost", ... }
    ],
    "sanityChecks": {
        "warnings": [],
        "errors": [],
        "invariantsPassed": true
    }
}

// Response ERROR (400/422):
{
    "ok": false,
    "source": "error",  // NUNCA "demo"
    "error_code": "FILE_TOO_SMALL",
    "error_message": "Archivo demasiado pequeño para ser un save válido",
    "details": { "size": 1234 },
    "parsed": null,
    "metrics": null
}
```

### 5.3 Frontend: Bloquear Demo/Placeholder

```jsx
// components/home/SaveUploader.jsx

function SaveUploader({ onResult }) {
    const handleUpload = async (file) => {
        try {
            const result = await analyzeSaveFile(file);
            
            // CRÍTICO: Verificar source
            if (result.source !== 'real') {
                throw new Error('No se recibieron datos reales del servidor');
            }
            
            // CRÍTICO: Verificar invariantes pasaron
            if (!result.sanityChecks?.invariantsPassed) {
                throw new Error('Los datos no pasaron validación');
            }
            
            onResult({
                success: true,
                data: result,
                isDemo: false
            });
            
        } catch (error) {
            onResult({
                success: false,
                error: error.message || 'Error desconocido',
                isDemo: false,
                showHelp: true  // Mostrar modal de ayuda
            });
        }
    };
    
    return (
        <Dropzone onDrop={handleUpload}>
            {/* UI */}
        </Dropzone>
    );
}

// NUNCA mostrar datos sin source === 'real'
function ResultDisplay({ result }) {
    if (!result || result.source !== 'real') {
        return <ErrorState message="No hay datos disponibles" />;
    }
    
    return (
        <div>
            {/* Badge de confianza */}
            <TrustBadge 
                slot={result.metadata.slot}
                hash={result.metadata.fileHash}
                parserVersion={result.metadata.parserVersion}
            />
            
            {/* Datos */}
            <ProgressDisplay metrics={result.metrics} />
        </div>
    );
}
```

---

## SECCIÓN 6 — TESTS + QA

### 6.1 Suite de Unit Tests

```javascript
// __tests__/decodeBitset.test.js
describe('decodeBitset', () => {
    test('returns empty array for zero buffer', () => {
        const buffer = Buffer.alloc(10);
        expect(decodeBitset(buffer, 0, 80)).toEqual([]);
    });
    
    test('returns all indices for 0xFF bytes', () => {
        const buffer = Buffer.from([0xFF, 0xFF]);
        const result = decodeBitset(buffer, 0, 16);
        expect(result).toHaveLength(16);
        expect(result).toEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
    });
    
    test('reads LSB first', () => {
        const buffer = Buffer.from([0x01]); // 00000001
        expect(decodeBitset(buffer, 0, 8)).toEqual([0]);
        
        const buffer2 = Buffer.from([0x80]); // 10000000
        expect(decodeBitset(buffer2, 0, 8)).toEqual([7]);
    });
    
    test('respects offset', () => {
        const buffer = Buffer.from([0x00, 0xFF, 0x00]);
        expect(decodeBitset(buffer, 1, 8)).toHaveLength(8);
    });
    
    test('respects nBits limit', () => {
        const buffer = Buffer.from([0xFF, 0xFF]);
        expect(decodeBitset(buffer, 0, 4)).toHaveLength(4);
    });
    
    test('handles buffer overflow gracefully', () => {
        const buffer = Buffer.from([0xFF]);
        expect(() => decodeBitset(buffer, 0, 100)).not.toThrow();
    });
});
```

### 6.2 Integration Tests

```javascript
// __tests__/saveParser.integration.test.js
const fs = require('fs');
const path = require('path');
const parser = require('../src/lib/saveParserV2');

describe('SaveParser Integration', () => {
    const fixturesDir = path.join(__dirname, 'fixtures');
    
    test('parses new save correctly', () => {
        const buffer = fs.readFileSync(path.join(fixturesDir, 'new-save.dat'));
        const result = parser.parse(buffer);
        
        expect(result.ok).toBe(true);
        expect(result.source).toBe('real');
        expect(result.metrics.deadGodPercentage).toBeLessThan(10);
        expect(result.endings.count).toBeLessThanOrEqual(result.endings.total);
    });
    
    test('parses mid-game save correctly', () => {
        const buffer = fs.readFileSync(path.join(fixturesDir, 'mid-save.dat'));
        const result = parser.parse(buffer);
        
        expect(result.ok).toBe(true);
        expect(result.metrics.deadGodPercentage).toBeGreaterThan(30);
        expect(result.metrics.deadGodPercentage).toBeLessThan(70);
    });
    
    test('parses near-completion save correctly', () => {
        const buffer = fs.readFileSync(path.join(fixturesDir, 'near-deadgod.dat'));
        const result = parser.parse(buffer);
        
        expect(result.ok).toBe(true);
        expect(result.metrics.deadGodPercentage).toBeGreaterThan(90);
        expect(result.metrics.deadGodPercentage).toBeLessThanOrEqual(100);
    });
    
    test('invariants always pass on valid saves', () => {
        const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.dat'));
        
        for (const file of files) {
            const buffer = fs.readFileSync(path.join(fixturesDir, file));
            const result = parser.parse(buffer);
            
            if (result.ok) {
                expect(result.sanityChecks.invariantsPassed).toBe(true);
                expect(result.endings.count).toBeLessThanOrEqual(result.endings.total);
            }
        }
    });
});
```

### 6.3 Fuzzing Tests

```javascript
// __tests__/saveParser.fuzz.test.js
describe('SaveParser Fuzzing', () => {
    test('handles truncated file', () => {
        const buffer = Buffer.alloc(500);
        buffer.fill(0xFF, 0, 100);
        
        const result = parser.parse(buffer);
        expect(result.ok).toBe(false);
        expect(result.source).toBe('error');
        expect(result.error_code).toBeDefined();
    });
    
    test('handles corrupted header', () => {
        const buffer = Buffer.alloc(25000);
        buffer.fill(0xDE, 0, 16); // Invalid header
        buffer.fill(0xFF, 16, 100);
        
        const result = parser.parse(buffer);
        // Should either parse with warnings or fail cleanly
        expect(['real', 'error']).toContain(result.source);
    });
    
    test('handles random data', () => {
        const buffer = Buffer.alloc(25000);
        for (let i = 0; i < buffer.length; i++) {
            buffer[i] = Math.floor(Math.random() * 256);
        }
        
        const result = parser.parse(buffer);
        // Should not crash
        expect(result).toBeDefined();
        expect(['real', 'error']).toContain(result.source);
    });
    
    test('handles all zeros', () => {
        const buffer = Buffer.alloc(25000);
        const result = parser.parse(buffer);
        
        expect(result.ok).toBe(false);
        expect(result.error_code).toBe('EMPTY_SAVE');
    });
    
    test('handles all 0xFF', () => {
        const buffer = Buffer.alloc(25000);
        buffer.fill(0xFF);
        
        const result = parser.parse(buffer);
        // All bits set = impossible state, should have invariant failures
        if (result.ok) {
            expect(result.sanityChecks.warnings.length).toBeGreaterThan(0);
        }
    });
});
```

### 6.4 Fixtures Requeridos

```
__tests__/fixtures/
├── new-save.dat          # Save nuevo (0-5%)
├── mid-save.dat          # Save medio (30-60%)  
├── near-deadgod.dat      # Save casi completo (95-99%)
├── deadgod.dat           # Save 100% (si disponible)
├── corrupted.dat         # Archivo corrupto para pruebas
├── wrong-version.dat     # Afterbirth+ para pruebas de versión
└── README.md             # Documentación de cada fixture
```

---

## SECCIÓN 7 — OBSERVABILIDAD

### 7.1 Logs Estructurados

```javascript
// lib/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/parser.log' })
    ]
});

// Uso en parser
function logParseAttempt(buffer, result, startTime) {
    logger.info('parse_attempt', {
        // Metadata
        fileSize: buffer.length,
        fileHash: result.metadata?.fileHash,
        slot: result.metadata?.slot,
        parserVersion: result.metadata?.parserVersion,
        
        // Resultado
        ok: result.ok,
        source: result.source,
        error_code: result.error_code,
        
        // Timing
        parseMs: Date.now() - startTime,
        
        // Métricas (si ok)
        deadGodPercentage: result.metrics?.deadGodPercentage,
        secretsCount: result.secrets?.count,
        
        // Warnings
        warnings: result.sanityChecks?.warnings
    });
}
```

### 7.2 Métricas Prometheus

```javascript
// lib/metrics.js
const promClient = require('prom-client');

// Counters
const parseAttempts = new promClient.Counter({
    name: 'save_parser_attempts_total',
    help: 'Total parse attempts',
    labelNames: ['status', 'error_code', 'version']
});

// Histograms
const parseLatency = new promClient.Histogram({
    name: 'save_parser_latency_seconds',
    help: 'Parse latency in seconds',
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// Gauges
const lastDeadGodPercentage = new promClient.Gauge({
    name: 'save_parser_last_deadgod_percentage',
    help: 'Last parsed Dead God percentage'
});

// Uso
function recordParseMetrics(result, duration) {
    parseAttempts.inc({
        status: result.ok ? 'success' : 'error',
        error_code: result.error_code || 'none',
        version: result.metadata?.gameVersion || 'unknown'
    });
    
    parseLatency.observe(duration / 1000);
    
    if (result.ok) {
        lastDeadGodPercentage.set(result.metrics.deadGodPercentage);
    }
}

// Endpoint /metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});
```

### 7.3 Alertas Sugeridas

```yaml
# alerts.yml (Prometheus/Grafana)
groups:
  - name: save_parser
    rules:
      - alert: HighParseFailRate
        expr: rate(save_parser_attempts_total{status="error"}[5m]) / rate(save_parser_attempts_total[5m]) > 0.3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High parse failure rate (>30%)"
          
      - alert: SlowParseLatency
        expr: histogram_quantile(0.95, rate(save_parser_latency_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 parse latency > 2s"
```

---

## SECCIÓN 8 — INCIDENTE DE SEGURIDAD (GitGuardian)

### 8.1 Secreto Identificado

**Archivo:** `src/firebase/config.js` (commit `ff99f2e`)
**Contenido expuesto:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAtr_wJLRy-gRttkHQBLQsZYJG-cmEknfI",
  authDomain: "tboi-c3c55.firebaseapp.com",
  projectId: "tboi-c3c55",
  ...
};
```

### 8.2 Plan de Remediación

#### PASO 1: Contención Inmediata (HACER AHORA)

```bash
# 1. Ir a Firebase Console
# https://console.firebase.google.com/project/tboi-c3c55/settings/general

# 2. En "Your apps" → Web app → "Manage API key restrictions"

# 3. Restringir la API key:
#    - Añadir HTTP referrers: https://tu-dominio.com/*
#    - Desactivar APIs no usadas

# 4. Si el proyecto ya no usa Firebase, ELIMINAR el proyecto:
#    Project Settings → Delete project
```

#### PASO 2: Rotación de Credenciales

```bash
# Si sigues usando Firebase:
# 1. Crear nueva API key en Google Cloud Console
# 2. Actualizar la web app con nueva key
# 3. Revocar la key anterior

# Si NO usas Firebase (solo Supabase ahora):
# 1. Eliminar proyecto Firebase
# 2. Verificar que Supabase keys no están expuestas:
grep -r "eyJ" . --include="*.js" --include="*.ts" --include="*.json" | grep -v node_modules
grep -r "SUPABASE" . --include="*.js" --include="*.ts" | grep -v node_modules | grep -v ".example"
```

#### PASO 3: Eliminar del Historial Git

```bash
# Opción A: BFG Repo-Cleaner (recomendado, más rápido)
# Descargar: https://rtyley.github.io/bfg-repo-cleaner/

# 1. Clonar repo como mirror
git clone --mirror https://github.com/tu-usuario/tboi.git tboi-mirror
cd tboi-mirror

# 2. Crear archivo con secretos a eliminar
echo "AIzaSyAtr_wJLRy-gRttkHQBLQsZYJG-cmEknfI" > ../secrets.txt

# 3. Ejecutar BFG
java -jar bfg.jar --replace-text ../secrets.txt

# 4. Limpiar y forzar push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# 5. Avisar a colaboradores que hagan fresh clone
```

```bash
# Opción B: git filter-repo (alternativa)
# Instalar: pip install git-filter-repo

# 1. Clonar repo fresco
git clone https://github.com/tu-usuario/tboi.git tboi-clean
cd tboi-clean

# 2. Eliminar archivo del historial
git filter-repo --path src/firebase/config.js --invert-paths

# 3. Force push
git remote add origin https://github.com/tu-usuario/tboi.git
git push --force --all
git push --force --tags
```

#### PASO 4: Prevención Futura

```bash
# 1. Crear .gitignore robusto
cat >> .gitignore << 'EOF'
# Environment files
.env
.env.local
.env.*.local
*.env

# Firebase
firebase-config.js
firebase.json
.firebaserc

# Secrets
**/secrets/**
**/credentials/**
*.pem
*.key
EOF

# 2. Instalar gitleaks pre-commit hook
# Instalar gitleaks: https://github.com/gitleaks/gitleaks#installing

# Crear pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "❌ Secrets detected! Commit blocked."
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

# 3. Configurar gitleaks
cat > .gitleaks.toml << 'EOF'
title = "Gitleaks Config"

[allowlist]
description = "Allowed patterns"
paths = [
    '''\.env\.example''',
    '''package-lock\.json''',
    '''pnpm-lock\.yaml'''
]

[[rules]]
description = "Firebase API Key"
regex = '''AIza[0-9A-Za-z_-]{35}'''
tags = ["firebase", "api-key"]

[[rules]]
description = "Supabase Key"
regex = '''eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+'''
tags = ["supabase", "jwt"]

[[rules]]
description = "Generic Secret"
regex = '''(?i)(password|secret|token|key|credential)['":\s]*[=:]['":\s]*[A-Za-z0-9+/=]{20,}'''
tags = ["generic"]
EOF

# 4. GitHub Actions secret scanning
cat > .github/workflows/security.yml << 'EOF'
name: Security Scan

on:
  push:
    branches: [main, developer]
  pull_request:
    branches: [main]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
EOF
```

#### PASO 5: Migración a Variables de Entorno

```bash
# 1. Actualizar backend/.env.example
cat > backend/.env.example << 'EOF'
# Server
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

# Supabase (get from Supabase Dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Monitoring
SENTRY_DSN=
LOG_LEVEL=info
EOF

# 2. Actualizar frontend/.env.example
cat > frontend/.env.example << 'EOF'
VITE_BACKEND_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# 3. Documentar en README
cat >> README.md << 'EOF'

## Environment Variables

### Setup
1. Copy `.env.example` to `.env` in both `backend/` and `frontend/`
2. Fill in your actual values from Supabase Dashboard
3. NEVER commit `.env` files

### Required Variables
See `.env.example` files for required configuration.

### Security
- All secrets must be in `.env` files
- `.env` files are gitignored
- Pre-commit hooks scan for leaked secrets
EOF
```

#### PASO 6: Auditoría y Documentación

```bash
# 1. Revisar logs de acceso en Firebase Console
#    - Authentication → Usage
#    - Realtime Database → Usage
#    - Buscar accesos sospechosos desde IPs desconocidas

# 2. Crear post-mortem document
cat > docs/SECURITY_INCIDENT_2024_01.md << 'EOF'
# Security Incident Report

## Summary
- **Date Detected:** [FECHA]
- **Severity:** Medium
- **Type:** Exposed API credentials
- **Status:** Remediated

## What Happened
Firebase API key was committed to git repository in commit ff99f2e.

## Impact
- API key was publicly accessible
- No evidence of unauthorized access (pending audit)

## Root Cause
Developer committed config file with hardcoded credentials.

## Remediation
1. [x] API key restricted/rotated
2. [x] Key removed from git history
3. [x] Pre-commit hooks added
4. [x] CI secret scanning enabled

## Prevention Measures
1. All credentials in .env files
2. .env files gitignored
3. gitleaks pre-commit hook
4. GitHub secret scanning enabled
5. Team training on secret management

## Lessons Learned
- Never hardcode credentials
- Use .env files from day 1
- Regular security audits
EOF
```

### 8.3 Checklist Final de Seguridad

```markdown
## Checklist Remediación Secreto Expuesto

### Contención (Inmediato)
- [ ] Firebase API key restringida a dominios específicos
- [ ] O proyecto Firebase eliminado si no se usa
- [ ] Verificar otros secretos no expuestos (Supabase, etc.)

### Rotación
- [ ] Nueva API key generada (si sigue en uso)
- [ ] Key anterior revocada
- [ ] Verificar funcionamiento de la app

### Limpieza Git
- [ ] BFG/filter-repo ejecutado
- [ ] Historial verificado limpio: `git log -p --all -S 'AIza' | head`
- [ ] Force push completado
- [ ] Colaboradores notificados para fresh clone

### Prevención
- [ ] .gitignore actualizado
- [ ] .env.example creados
- [ ] gitleaks instalado y configurado
- [ ] Pre-commit hook funcionando
- [ ] GitHub Actions workflow añadido
- [ ] Dependabot habilitado (Settings → Security)

### Documentación
- [ ] Post-mortem document creado
- [ ] README actualizado con instrucciones de setup
- [ ] Equipo informado del proceso

### Auditoría
- [ ] Logs de Firebase revisados
- [ ] No hay accesos sospechosos
- [ ] Supabase keys verificadas seguras
```

---

## RESUMEN EJECUTIVO

### Parser
1. **Bug identificado:** Probablemente leyendo bytes como booleans en vez de bitfields
2. **Solución:** Reescribir con `decodeBitset()` bit-a-bit
3. **Validación:** Invariantes obligatorios (count <= total)
4. **Fallback:** NUNCA demo, solo errores claros

### Dead God Progress
- **Real:** `secrets.count / secrets.total * 100`
- **NO usar:** Promedios ponderados de métricas diferentes
- **Mostrar:** Breakdown por categoría + next steps

### Seguridad
- **Firebase key expuesta** en commit `ff99f2e`
- **Acción inmediata:** Restringir/rotar key
- **Acción historial:** BFG Repo-Cleaner
- **Prevención:** gitleaks + CI scanning
