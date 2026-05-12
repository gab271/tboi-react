/**
 * User Save Progress Routes
 * GET  /api/users/:userId/progress  — fetch latest saved progress
 * POST /api/users/:userId/progress  — upsert progress from a parsed save file
 */

const express = require('express');
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PROGRESS_BODY = 512 * 1024; // 512 KB

// ── GET ────────────────────────────────────────────────────────────────────────

router.get('/:userId/progress', requireAuth, async (req, res) => {
  const { userId } = req.params;

  if (!UUID_REGEX.test(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

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

  if (!UUID_REGEX.test(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (JSON.stringify(req.body).length > MAX_PROGRESS_BODY) {
    return res.status(413).json({ error: 'Payload too large' });
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

  const percent = Number(deadGodPercent);
  if (isNaN(percent) || percent < 0 || percent > 100) {
    return res.status(400).json({ error: 'deadGodPercent must be between 0 and 100' });
  }

  const slotNum = Number(slot);
  if (isNaN(slotNum) || slotNum < 1 || slotNum > 3) {
    return res.status(400).json({ error: 'slot must be 1, 2, or 3' });
  }

  if (typeof items !== 'object' || Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an object' });
  }

  if (typeof achievements !== 'object' || Array.isArray(achievements)) {
    return res.status(400).json({ error: 'achievements must be an object' });
  }

  if (typeof characters !== 'object' || Array.isArray(characters)) {
    return res.status(400).json({ error: 'characters must be an object' });
  }

  const record = {
    user_id: userId,
    save_hash: saveHash ? String(saveHash).slice(0, 128) : null,
    dead_god_percent: percent,
    slot: slotNum,
    items,
    achievements,
    characters,
    summary: (summary && typeof summary === 'object' && !Array.isArray(summary)) ? summary : {},
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
