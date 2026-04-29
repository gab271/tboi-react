/**
 * Synergies API Routes
 * POST /api/synergies/analyze - Analiza combinación de ítems
 * GET /api/synergies/popular - Sinergias más buscadas
 */

const express = require('express');
const { calculateBuildState, generateExplanation } = require('../lib/synergyEngine');
const { ITEMS_WITH_EFFECTS, getItemById } = require('../lib/itemsWithEffects');
const { logActivity } = require('./activity');

const router = express.Router();

/**
 * POST /api/synergies/analyze
 * Analiza una combinación de ítems y devuelve el estado calculado
 */
router.post('/analyze', async (req, res) => {
  try {
    const { itemIds, itemNames, characterId } = req.body;
    
    // Soportar tanto IDs como nombres
    let items = [];
    
    if (itemIds && Array.isArray(itemIds)) {
      items = itemIds
        .map(id => getItemById(Number(id)))
        .filter(Boolean);
    } else if (itemNames && Array.isArray(itemNames)) {
      items = itemNames
        .map(name => ITEMS_WITH_EFFECTS.find(i => 
          i.name.toLowerCase() === name.toLowerCase()
        ))
        .filter(Boolean);
    }
    
    if (items.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Se requiere al menos un ítem válido',
        hint: 'Envía itemIds (array de números) o itemNames (array de strings)'
      });
    }
    
    // Calcular estado de la build
    const buildState = calculateBuildState(items);
    
    // Generar explicación
    const explanation = generateExplanation(items, buildState);
    
    // Registrar actividad
    logActivity('synergy_checked', req.user?.id, {
      itemCount: items.length,
      items: items.map(i => i.name)
    });
    
    res.json({
      ok: true,
      build: {
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          priority: i.priority,
          transformationTags: i.transformationTags || []
        })),
        state: {
          damage: Number((buildState.damage * buildState.damageMultiplier).toFixed(2)),
          tearType: buildState.tearType,
          tearFlags: buildState.tearFlags,
          tearCount: buildState.tearCount,
          tearsPerSecond: Number((30 / (buildState.tears * buildState.tearDelayMultiplier + 1)).toFixed(2)),
          dps: Number(buildState.finalDPS.toFixed(0)),
          transformations: buildState.transformations,
          canFly: buildState.canFly || false,
        },
        explanation,
        rating: explanation.explanations.find(e => e.type === 'verdict')
      }
    });
    
  } catch (error) {
    console.error('[SYNERGIES] Error:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al analizar sinergias'
    });
  }
});

/**
 * GET /api/synergies/items
 * Lista todos los ítems disponibles para análisis
 */
router.get('/items', (req, res) => {
  const items = ITEMS_WITH_EFFECTS.map(item => ({
    id: item.id,
    name: item.name,
    priority: item.priority,
    hasEffects: !!item.effects,
    transformationTags: item.transformationTags || []
  }));
  
  res.json({
    ok: true,
    count: items.length,
    items
  });
});

/**
 * GET /api/synergies/transformations
 * Lista todas las transformaciones
 */
router.get('/transformations', (req, res) => {
  const transformations = {};
  
  ITEMS_WITH_EFFECTS.forEach(item => {
    if (item.transformationTags) {
      item.transformationTags.forEach(tag => {
        if (!transformations[tag]) {
          transformations[tag] = { items: [], threshold: 3 };
        }
        transformations[tag].items.push({
          id: item.id,
          name: item.name
        });
      });
    }
  });
  
  res.json({
    ok: true,
    transformations
  });
});

/**
 * GET /api/synergies/popular
 * Sinergias más analizadas
 */
router.get('/popular', async (req, res) => {
  // Por ahora devolver sinergias conocidas
  const popular = [
    {
      name: 'Brimstone + Soy Milk',
      items: ['Brimstone', 'Soy Milk'],
      rating: 'S',
      description: 'Láser ametralladora devastador'
    },
    {
      name: 'Tech X + Brimstone',
      items: ['Tech X', 'Brimstone'],
      rating: 'S',
      description: 'Anillos de Brimstone'
    },
    {
      name: 'Polyphemus + Brimstone',
      items: ['Polyphemus', 'Brimstone'],
      rating: 'A',
      description: 'Láser de alto daño'
    },
    {
      name: 'Sacred Heart + cualquier daño',
      items: ['Sacred Heart'],
      rating: 'A',
      description: 'x2.3 daño + homing'
    },
    {
      name: 'Guppy Transformation',
      items: ['Dead Cat', 'Guppy\'s Head', 'Guppy\'s Tail'],
      rating: 'S',
      description: 'Vuelo + moscas infinitas'
    }
  ];
  
  res.json({
    ok: true,
    popular
  });
});

/**
 * POST /api/synergies/contribute
 * Registra una contribución de sinergia de la comunidad
 */
router.post('/contribute', async (req, res) => {
  const { itemA, itemB, description } = req.body;

  if (!itemA || !itemB || !description) {
    return res.status(400).json({ ok: false, error: 'itemA, itemB and description are required' });
  }

  logActivity('synergy_contribution', req.user?.id || null, { itemA, itemB, description });

  res.json({ ok: true });
});

module.exports = router;
