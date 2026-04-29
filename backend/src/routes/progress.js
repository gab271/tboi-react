/**
 * User Save Progress Routes
 * GET  /api/users/:userId/progress  — fetch latest saved progress
 * POST /api/users/:userId/progress  — upsert progress from a parsed save file
 */

const express = require('express');
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ── GET ────────────────────────────────────────────────────────────────────────

router.get('/:userId/progress', requireAuth, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data, error } = await supabaseAdmin
    .from('user_save_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'No progress saved yet' });
    }
    console.error('[progress] GET error:', error);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }

  res.json(data);
});

// ── POST ───────────────────────────────────────────────────────────────────────

router.post('/:userId/progress', requireAuth, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const {
    saveHash,
    deadGodPercent,
    slot,
    items,
    achievements,
    characters,
    summary,
  } = req.body;

  if (deadGodPercent === undefined || !items || !achievements || !characters) {
    return res.status(400).json({ error: 'Missing required fields: deadGodPercent, items, achievements, characters' });
  }

  const record = {
    user_id: userId,
    save_hash: saveHash || null,
    dead_god_percent: Number(deadGodPercent) || 0,
    slot: Number(slot) || 1,
    items,
    achievements,
    characters,
    summary: summary || {},
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('user_save_progress')
    .upsert(record, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[progress] POST error:', error);
    return res.status(500).json({ error: 'Failed to save progress' });
  }

  res.status(200).json({ success: true, progress: data });
});

module.exports = router;
