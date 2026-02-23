/**
 * COMPLETION MARKS - The Binding of Isaac: Repentance
 * 
 * Estructura del grid de completion marks que aparece al seleccionar un personaje.
 * El juego usa 12 marks organizados en un grid 4x3.
 * 
 * Layout del juego (filas x columnas):
 * ┌────────────┬────────────┬────────────┬────────────┐
 * │ Mom's Heart│   Isaac    │    ???     │   Satan    │
 * ├────────────┼────────────┼────────────┼────────────┤
 * │  The Lamb  │ Boss Rush  │    Hush    │ Mega Satan │
 * ├────────────┼────────────┼────────────┼────────────┤
 * │  Delirium  │   Mother   │ The Beast  │  Greedier  │
 * └────────────┴────────────┴────────────┴────────────┘
 */

/**
 * Mapeo de índices del save parser a IDs del frontend
 * El save parser usa índices 0-33 para los personajes
 */
export const SAVE_PARSER_CHARACTER_MAP = [
  // Vanilla (0-16)
  'isaac',
  'magdalene',
  'cain',
  'judas',
  'blue_baby',
  'eve',
  'samson',
  'azazel',
  'lazarus',
  'eden',
  'the_lost',
  'lilith',
  'keeper',
  'apollyon',
  'the_forgotten',
  'bethany',
  'jacob_esau',
  // Tainted (17-33)
  'tainted_isaac',
  'tainted_magdalene',
  'tainted_cain',
  'tainted_judas',
  'tainted_blue_baby',
  'tainted_eve',
  'tainted_samson',
  'tainted_azazel',
  'tainted_lazarus',
  'tainted_eden',
  'tainted_lost',
  'tainted_lilith',
  'tainted_keeper',
  'tainted_apollyon',
  'tainted_forgotten',
  'tainted_bethany',
  'tainted_jacob',
];

// Mapeo de mark ID a asset del juego
export const COMPLETION_MARKS = [
  {
    id: 'heart',
    internalKey: 'moms_heart', // Key usado en save file
    label: "Mom's Heart",
    labelShort: "Heart",
    description: "Defeat Mom's Heart / It Lives on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mom\'s Heart.png',
    iconAlt: '/sprites/4_Bosses/0_Completion Mark Bosses/It Lives.png', // Tras desbloquear It Lives
    gridPosition: [0, 0], // row, col
    order: 0,
  },
  {
    id: 'isaac',
    internalKey: 'isaac',
    label: 'Isaac',
    labelShort: "Isaac",
    description: "Defeat Isaac in the Cathedral on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Isaac.png',
    gridPosition: [0, 1],
    order: 1,
  },
  {
    id: 'bluebaby',
    internalKey: 'blue_baby',
    label: '???',
    labelShort: "???",
    description: "Defeat ??? (Blue Baby) in The Chest on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Blue Baby.png',
    gridPosition: [0, 2],
    order: 2,
  },
  {
    id: 'satan',
    internalKey: 'satan',
    label: 'Satan',
    labelShort: "Satan",
    description: "Defeat Satan in Sheol on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Satan.png',
    gridPosition: [0, 3],
    order: 3,
  },
  {
    id: 'lamb',
    internalKey: 'the_lamb',
    label: 'The Lamb',
    labelShort: "Lamb",
    description: "Defeat The Lamb in the Dark Room on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/The Lamb.png',
    gridPosition: [1, 0],
    order: 4,
  },
  {
    id: 'bossrush',
    internalKey: 'boss_rush',
    label: 'Boss Rush',
    labelShort: "Rush",
    description: "Complete Boss Rush on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mom.png', // Boss Rush es derrotar a Mom rápido
    gridPosition: [1, 1],
    order: 5,
  },
  {
    id: 'hush',
    internalKey: 'hush',
    label: 'Hush',
    labelShort: "Hush",
    description: "Defeat Hush on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Hush.png',
    gridPosition: [1, 2],
    order: 6,
  },
  {
    id: 'megasatan',
    internalKey: 'mega_satan',
    label: 'Mega Satan',
    labelShort: "Mega",
    description: "Defeat Mega Satan on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mega Satan.png',
    gridPosition: [1, 3],
    order: 7,
  },
  {
    id: 'delirium',
    internalKey: 'delirium',
    label: 'Delirium',
    labelShort: "Delir.",
    description: "Defeat Delirium in The Void on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Delirium (telefraggy boi).png',
    gridPosition: [2, 0],
    order: 8,
  },
  {
    id: 'mother',
    internalKey: 'mother',
    label: 'Mother',
    labelShort: "Mother",
    description: "Defeat Mother in Corpse II on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mother.png',
    gridPosition: [2, 1],
    order: 9,
  },
  {
    id: 'beast',
    internalKey: 'the_beast',
    label: 'The Beast',
    labelShort: "Beast",
    description: "Defeat The Beast in Home on Hard Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/The Beast.png',
    gridPosition: [2, 2],
    order: 10,
  },
  {
    id: 'greedier',
    internalKey: 'greedier',
    label: 'Greedier',
    labelShort: "Greed",
    description: "Complete Greedier Mode",
    icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Ultra Greedier.png',
    iconAlt: '/sprites/4_Bosses/0_Completion Mark Bosses/Ultra Greed.png', // Normal Greed mode
    gridPosition: [2, 3],
    order: 11,
  },
];

// Estados posibles de un mark
export const MARK_STATUS = {
  NONE: 0,      // No completado
  NORMAL: 1,    // Completado en Normal
  HARD: 2,      // Completado en Hard (icono rojo)
};

// Fuentes de datos
export const MARK_SOURCE = {
  MANUAL: 'manual',   // Editado manualmente por el usuario
  SAVE: 'save',       // Importado desde save file
  MERGED: 'merged',   // Combinación de ambos
};

/**
 * Estructura de datos para marks de un personaje
 * @typedef {Object} CharacterMarksData
 * @property {string} characterId - ID del personaje
 * @property {Object.<string, MarkData>} marks - Marks keyed by mark ID
 * @property {string} source - 'manual' | 'save' | 'merged'
 * @property {string} lastUpdated - ISO timestamp
 * @property {string|null} saveFileHash - Hash del save si source='save'
 */

/**
 * Estructura de un mark individual
 * @typedef {Object} MarkData
 * @property {number} status - 0=none, 1=normal, 2=hard
 * @property {string} source - 'manual' | 'save'
 * @property {string} updatedAt - ISO timestamp
 */

/**
 * Genera estructura vacía de marks para un personaje
 * @param {string} characterId 
 * @returns {CharacterMarksData}
 */
export function createEmptyMarks(characterId) {
  const marks = {};
  COMPLETION_MARKS.forEach(mark => {
    marks[mark.id] = {
      status: MARK_STATUS.NONE,
      source: null,
      updatedAt: null,
    };
  });
  
  return {
    characterId,
    marks,
    source: MARK_SOURCE.MANUAL,
    lastUpdated: new Date().toISOString(),
    saveFileHash: null,
  };
}

/**
 * Convierte datos del save parser al formato de marks
 * @param {string} characterId 
 * @param {Array} saveMarks - Array de marks del parser [{name, completed, value}]
 * @param {string} saveHash 
 * @returns {CharacterMarksData}
 */
export function saveDataToMarks(characterId, saveMarks, saveHash) {
  const marks = {};
  const now = new Date().toISOString();
  
  // Mapeo de nombres del parser a IDs
  const nameToId = {
    "Mom's Heart": 'heart',
    "Isaac": 'isaac',
    "???": 'bluebaby',
    "Satan": 'satan',
    "The Lamb": 'lamb',
    "Boss Rush": 'bossrush',
    "Hush": 'hush',
    "Mega Satan": 'megasatan',
    "Delirium": 'delirium',
    "Mother": 'mother',
    "The Beast": 'beast',
    "Greed Mode": 'greedier',
  };
  
  // Inicializar todos como vacíos
  COMPLETION_MARKS.forEach(mark => {
    marks[mark.id] = {
      status: MARK_STATUS.NONE,
      source: MARK_SOURCE.SAVE,
      updatedAt: now,
    };
  });
  
  // Llenar con datos del save
  saveMarks.forEach(saveMark => {
    const markId = nameToId[saveMark.name];
    if (markId && saveMark.completed) {
      // value > 1 suele indicar Hard mode en el save
      marks[markId] = {
        status: saveMark.value > 1 ? MARK_STATUS.HARD : MARK_STATUS.NORMAL,
        source: MARK_SOURCE.SAVE,
        updatedAt: now,
      };
    }
  });
  
  return {
    characterId,
    marks,
    source: MARK_SOURCE.SAVE,
    lastUpdated: now,
    saveFileHash: saveHash,
  };
}

/**
 * Mezcla marks manuales con datos del save (solo completa faltantes)
 * @param {CharacterMarksData} manualData 
 * @param {CharacterMarksData} saveData 
 * @returns {CharacterMarksData}
 */
export function mergeMarks(manualData, saveData) {
  const merged = { ...manualData };
  const now = new Date().toISOString();
  
  Object.keys(saveData.marks).forEach(markId => {
    const manual = manualData.marks[markId];
    const save = saveData.marks[markId];
    
    // Solo actualizar si manual está vacío pero save tiene datos
    if (manual.status === MARK_STATUS.NONE && save.status !== MARK_STATUS.NONE) {
      merged.marks[markId] = {
        ...save,
        source: MARK_SOURCE.MERGED,
        updatedAt: now,
      };
    }
    // O si save tiene un status mayor (hard > normal)
    else if (save.status > manual.status) {
      merged.marks[markId] = {
        ...save,
        source: MARK_SOURCE.MERGED,
        updatedAt: now,
      };
    }
  });
  
  merged.source = MARK_SOURCE.MERGED;
  merged.lastUpdated = now;
  merged.saveFileHash = saveData.saveFileHash;
  
  return merged;
}

/**
 * Calcula estadísticas de completion para un personaje
 * @param {CharacterMarksData} data 
 * @returns {{completed: number, total: number, hardCompleted: number, percentage: number}}
 */
export function calculateCompletion(data) {
  let completed = 0;
  let hardCompleted = 0;
  const total = COMPLETION_MARKS.length;
  
  Object.values(data.marks).forEach(mark => {
    if (mark.status >= MARK_STATUS.NORMAL) completed++;
    if (mark.status === MARK_STATUS.HARD) hardCompleted++;
  });
  
  return {
    completed,
    hardCompleted,
    total,
    percentage: Math.round((completed / total) * 100),
    isFullyHard: hardCompleted === total,
  };
}

// Para compatibilidad con código antiguo
export const characterCompletionMarks = COMPLETION_MARKS.map(m => ({
  id: m.id,
  label: m.label,
  icon: m.labelShort, // Emoji/texto corto para fallback
}));

/**
 * Convierte datos completos del save parser a formato de marks por personaje
 * @param {Object} parsedSave - Resultado de parseSaveFile
 * @returns {Object.<string, CharacterMarksData>} - Marks por characterId
 */
export function parseSaveToAllMarks(parsedSave) {
  if (!parsedSave?.parsed?.characters) {
    return {};
  }
  
  const { characters } = parsedSave.parsed;
  const saveHash = parsedSave.parsed.fileHash;
  const result = {};
  
  characters.forEach((char, index) => {
    const characterId = SAVE_PARSER_CHARACTER_MAP[index];
    if (!characterId) return;
    
    result[characterId] = saveDataToMarks(characterId, char.marks, saveHash);
  });
  
  return result;
}