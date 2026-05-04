const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const VALID_TIERS    = ['S', 'A', 'B', 'C', 'D', 'F'];
const VALID_RUN_TYPES = ['normal', 'greed', 'greedier', 'challenge'];

/**
 * GET /api/tierlist
 * Public. Returns aggregated tier scores for all items.
 * Query params:
 *   character_id  string  default 'ALL'
 *   run_type      string  default 'normal'
 */
router.get('/', async (req, res) => {
    const { character_id = 'ALL', run_type = 'normal' } = req.query;

    if (!VALID_RUN_TYPES.includes(run_type)) {
        return res.status(400).json({ error: `run_type must be one of: ${VALID_RUN_TYPES.join(', ')}` });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('item_tier_scores')
            .select('item_id, avg_score, computed_tier, vote_count, updated_at')
            .eq('character_id', character_id)
            .eq('run_type', run_type)
            .order('avg_score', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching tier list:', err);
        res.status(500).json({ error: 'Failed to fetch tier list' });
    }
});

/**
 * GET /api/tierlist/my-votes
 * Auth required. Returns the authenticated user's votes.
 * Query params:
 *   character_id  string  optional
 *   run_type      string  optional
 */
router.get('/my-votes', requireAuth, async (req, res) => {
    const { character_id, run_type } = req.query;

    try {
        let query = supabaseAdmin
            .from('item_tier_votes')
            .select('item_id, tier, character_id, run_type, updated_at')
            .eq('user_id', req.user.id);

        if (character_id) query = query.eq('character_id', character_id);
        if (run_type)     query = query.eq('run_type', run_type);

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (err) {
        console.error('Error fetching user votes:', err);
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

/**
 * POST /api/tierlist/vote
 * Auth required. Cast or update a vote (upsert).
 * Body: { item_id, tier, character_id?, run_type? }
 */
router.post('/vote', requireAuth, async (req, res) => {
    const {
        item_id,
        tier,
        character_id = 'ALL',
        run_type     = 'normal',
    } = req.body;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!item_id || !UUID_RE.test(item_id)) {
        return res.status(400).json({ error: 'item_id must be a valid UUID' });
    }
    if (!VALID_TIERS.includes(tier)) {
        return res.status(400).json({ error: `tier must be one of: ${VALID_TIERS.join(', ')}` });
    }
    if (!VALID_RUN_TYPES.includes(run_type)) {
        return res.status(400).json({ error: `run_type must be one of: ${VALID_RUN_TYPES.join(', ')}` });
    }

    try {
        const { data: item, error: itemError } = await supabaseAdmin
            .from('codex_items')
            .select('id')
            .eq('id', item_id)
            .single();

        if (itemError || !item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const { data, error } = await supabaseAdmin
            .from('item_tier_votes')
            .upsert(
                {
                    user_id:      req.user.id,
                    item_id,
                    tier,
                    character_id,
                    run_type,
                    updated_at:   new Date().toISOString(),
                },
                { onConflict: 'user_id,item_id,character_id,run_type' }
            )
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, vote: data });
    } catch (err) {
        console.error('Error casting vote:', err);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

/**
 * DELETE /api/tierlist/vote
 * Auth required. Remove a user's vote.
 * Body: { item_id, character_id?, run_type? }
 */
router.delete('/vote', requireAuth, async (req, res) => {
    const {
        item_id,
        character_id = 'ALL',
        run_type     = 'normal',
    } = req.body;

    if (!item_id) {
        return res.status(400).json({ error: 'item_id is required' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('item_tier_votes')
            .delete()
            .match({ user_id: req.user.id, item_id, character_id, run_type });

        if (error) throw error;

        res.json({ success: true });
    } catch (err) {
        console.error('Error removing vote:', err);
        res.status(500).json({ error: 'Failed to remove vote' });
    }
});

module.exports = router;
