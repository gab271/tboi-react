/**
 * Completion Marks Routes
 * API endpoints for managing character completion marks
 * 
 * GET  /api/users/:userId/marks         - Get all marks for user
 * GET  /api/users/:userId/marks/:charId - Get marks for specific character
 * PUT  /api/users/:userId/marks/:charId - Save/update marks for character
 * DELETE /api/users/:userId/marks/:charId - Reset marks for character
 */

const express = require('express');
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// GET ALL MARKS FOR USER
// ============================================

/**
 * GET /api/users/:userId/marks
 * Returns all completion marks for a user across all characters
 */
router.get('/:userId/marks', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user matches authenticated user
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('completion_marks')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Convert array to object keyed by character_id
    const marksByCharacter = {};
    for (const row of data || []) {
      marksByCharacter[row.character_id] = {
        characterId: row.character_id,
        marks: row.marks_data,
        source: row.source,
        saveHash: row.save_hash,
        lastUpdated: row.updated_at,
      };
    }
    
    res.json(marksByCharacter);
    
  } catch (err) {
    console.error('[marks] Error fetching all marks:', err);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// ============================================
// GET MARKS FOR CHARACTER
// ============================================

/**
 * GET /api/users/:userId/marks/:characterId
 * Returns completion marks for a specific character
 */
router.get('/:userId/marks/:characterId', requireAuth, async (req, res) => {
  try {
    const { userId, characterId } = req.params;
    
    // Verify user matches authenticated user
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { data, error } = await supabaseAdmin
      .from('completion_marks')
      .select('*')
      .eq('user_id', userId)
      .eq('character_id', characterId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return res.status(404).json({ error: 'Not found' });
      }
      throw error;
    }
    
    res.json({
      characterId: data.character_id,
      marks: data.marks_data,
      source: data.source,
      saveHash: data.save_hash,
      lastUpdated: data.updated_at,
    });
    
  } catch (err) {
    console.error('[marks] Error fetching marks:', err);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// ============================================
// SAVE/UPDATE MARKS FOR CHARACTER
// ============================================

/**
 * PUT /api/users/:userId/marks/:characterId
 * Creates or updates completion marks for a character
 */
router.put('/:userId/marks/:characterId', requireAuth, async (req, res) => {
  try {
    const { userId, characterId } = req.params;
    const { marks, source, saveHash } = req.body;
    
    // Verify user matches authenticated user
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Validate marks data structure
    if (!marks || typeof marks !== 'object') {
      return res.status(400).json({ error: 'Invalid marks data' });
    }
    
    // Upsert the marks
    const { data, error } = await supabaseAdmin
      .from('completion_marks')
      .upsert({
        user_id: userId,
        character_id: characterId,
        marks_data: marks,
        source: source || 'manual',
        save_hash: saveHash || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,character_id',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      characterId: data.character_id,
      marks: data.marks_data,
      source: data.source,
      lastUpdated: data.updated_at,
    });
    
  } catch (err) {
    console.error('[marks] Error saving marks:', err);
    res.status(500).json({ error: 'Failed to save marks' });
  }
});

// ============================================
// DELETE/RESET MARKS FOR CHARACTER
// ============================================

/**
 * DELETE /api/users/:userId/marks/:characterId
 * Resets completion marks for a character
 */
router.delete('/:userId/marks/:characterId', requireAuth, async (req, res) => {
  try {
    const { userId, characterId } = req.params;
    
    // Verify user matches authenticated user
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const { error } = await supabaseAdmin
      .from('completion_marks')
      .delete()
      .eq('user_id', userId)
      .eq('character_id', characterId);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Marks reset' });
    
  } catch (err) {
    console.error('[marks] Error deleting marks:', err);
    res.status(500).json({ error: 'Failed to reset marks' });
  }
});

// ============================================
// IMPORT FROM SAVE FILE
// ============================================

/**
 * POST /api/users/:userId/marks/import
 * Imports marks from a parsed save file for all characters
 * 
 * Expected body: {
 *   saveHash: string,
 *   characters: { [characterId]: { marks: {...} } }
 * }
 */
router.post('/:userId/marks/import', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { saveHash, characters } = req.body;
    
    // Verify user matches authenticated user
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (!saveHash || !characters || typeof characters !== 'object') {
      return res.status(400).json({ error: 'Invalid import data' });
    }
    
    // Prepare batch upsert
    const records = Object.entries(characters).map(([characterId, charData]) => ({
      user_id: userId,
      character_id: characterId,
      marks_data: charData.marks,
      source: 'save',
      save_hash: saveHash,
      updated_at: new Date().toISOString(),
    }));
    
    const { data, error } = await supabaseAdmin
      .from('completion_marks')
      .upsert(records, {
        onConflict: 'user_id,character_id',
      })
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      imported: data.length,
      characters: data.map(d => d.character_id),
    });
    
  } catch (err) {
    console.error('[marks] Error importing marks:', err);
    res.status(500).json({ error: 'Failed to import marks' });
  }
});

module.exports = router;
