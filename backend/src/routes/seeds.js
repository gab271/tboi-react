const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth } = require('../middleware/authMiddleware');

const SEED_REGEX   = /^[A-Z0-9]{8}$/;
const VALID_VERSIONS  = ['repentance_plus', 'repentance', 'afterbirth_plus', 'rebirth'];
const VALID_PLATFORMS = ['pc', 'switch', 'playstation', 'xbox'];
const VALID_SORTS     = ['top', 'new', 'hot'];
const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeSeed(raw) {
    return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// ─── GET /api/seeds ───────────────────────────────────────────────────────────
// Public. Paginated feed with filters.
// Query: version, platform, tags (CSV), sort, search, page

router.get('/', async (req, res) => {
    const {
        version,
        platform,
        tags,
        sort    = 'top',
        search,
        page    = 1,
    } = req.query;

    if (!VALID_SORTS.includes(sort)) {
        return res.status(400).json({ error: `sort must be one of: ${VALID_SORTS.join(', ')}` });
    }

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const from     = (pageNum - 1) * PAGE_SIZE;
    const to       = from + PAGE_SIZE - 1;

    try {
        let query = supabaseAdmin
            .from('community_seeds')
            .select(`
                id, seed_code, title, description,
                game_version, platform,
                score, upvotes, downvotes,
                created_at, author_id,
                profiles:author_id ( username, avatar_url ),
                seed_tags ( tag )
            `, { count: 'exact' })
            .eq('status', 'published');

        if (version && VALID_VERSIONS.includes(version)) {
            query = query.eq('game_version', version);
        }
        if (platform && VALID_PLATFORMS.includes(platform)) {
            query = query.eq('platform', platform);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,seed_code.ilike.%${search}%`);
        }

        // Sort
        if (sort === 'top' || sort === 'hot') {
            query = query.order('score', { ascending: false }).order('created_at', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        query = query.range(from, to);

        const { data, count, error } = await query;
        if (error) throw error;

        // Tag filter (post-filter since Supabase doesn't support JOIN WHERE on nested tables)
        let results = data || [];
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
            if (tagList.length > 0) {
                results = results.filter(s => {
                    const seedTagNames = (s.seed_tags || []).map(t => t.tag.toLowerCase());
                    return tagList.every(t => seedTagNames.includes(t));
                });
            }
        }

        // Flatten tags
        const formatted = results.map(s => ({
            ...s,
            tags: (s.seed_tags || []).map(t => t.tag),
            author: s.profiles,
            seed_tags: undefined,
            profiles: undefined,
        }));

        res.json({
            data: formatted,
            meta: { page: pageNum, pageSize: PAGE_SIZE, total: count },
        });
    } catch (err) {
        console.error('Error fetching seeds:', err);
        res.status(500).json({ error: 'Failed to fetch seeds' });
    }
});

// ─── GET /api/seeds/tags ──────────────────────────────────────────────────────
// Public. Returns top 30 most-used tags.

router.get('/tags', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('seed_tags')
            .select('tag')
            .limit(1000);

        if (error) throw error;

        const counts = {};
        (data || []).forEach(({ tag }) => {
            counts[tag] = (counts[tag] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30)
            .map(([tag, count]) => ({ tag, count }));

        res.json(sorted);
    } catch (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// ─── POST /api/seeds ──────────────────────────────────────────────────────────
// Auth required. Submit a new seed.

router.post('/', requireAuth, async (req, res) => {
    const {
        seed_code: rawCode,
        title,
        description,
        game_version = 'repentance_plus',
        platform     = 'pc',
        tags         = [],
    } = req.body;

    // ── Validation ──
    const seedCode = normalizeSeed(rawCode || '');

    if (!SEED_REGEX.test(seedCode)) {
        return res.status(400).json({
            error: 'Invalid seed format. Seeds must be exactly 8 characters: letters A-Z and numbers 0-9.',
            field: 'seed_code',
        });
    }
    if (!title || title.trim().length < 3 || title.trim().length > 60) {
        return res.status(400).json({ error: 'Title must be between 3 and 60 characters.', field: 'title' });
    }
    if (!VALID_VERSIONS.includes(game_version)) {
        return res.status(400).json({ error: `game_version must be one of: ${VALID_VERSIONS.join(', ')}` });
    }
    if (!VALID_PLATFORMS.includes(platform)) {
        return res.status(400).json({ error: `platform must be one of: ${VALID_PLATFORMS.join(', ')}` });
    }

    // ── Duplicate check (same seed + version) ──
    const { data: existing } = await supabaseAdmin
        .from('community_seeds')
        .select('id, title')
        .eq('seed_code', seedCode)
        .eq('game_version', game_version)
        .eq('status', 'published')
        .maybeSingle();

    if (existing) {
        return res.status(409).json({
            error: 'This seed already exists for that game version.',
            existing_id: existing.id,
        });
    }

    try {
        // ── Insert seed ──
        const { data: seed, error: seedError } = await supabaseAdmin
            .from('community_seeds')
            .insert({
                author_id:    req.user.id,
                seed_code:    seedCode,
                title:        title.trim(),
                description:  description?.trim() || null,
                game_version,
                platform,
            })
            .select()
            .single();

        if (seedError) throw seedError;

        // ── Insert tags ──
        if (Array.isArray(tags) && tags.length > 0) {
            const tagRows = [...new Set(
                tags.map(t => t.toLowerCase().trim()).filter(t => t.length > 0 && t.length <= 40)
            )].slice(0, 10).map(tag => ({ seed_id: seed.id, tag }));

            if (tagRows.length > 0) {
                await supabaseAdmin.from('seed_tags').insert(tagRows);
            }
        }

        res.status(201).json({ success: true, seed });
    } catch (err) {
        console.error('Error creating seed:', err);
        res.status(500).json({ error: 'Failed to create seed' });
    }
});

// ─── POST /api/seeds/:id/vote ─────────────────────────────────────────────────
// Auth required. Upsert a vote (1 or -1). Same value = remove vote.

router.post('/:id/vote', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
        return res.status(400).json({ error: 'value must be 1 (upvote) or -1 (downvote)' });
    }

    try {
        // Check seed exists
        const { data: seed } = await supabaseAdmin
            .from('community_seeds')
            .select('id')
            .eq('id', id)
            .eq('status', 'published')
            .maybeSingle();

        if (!seed) return res.status(404).json({ error: 'Seed not found' });

        // Check existing vote
        const { data: existing } = await supabaseAdmin
            .from('seed_votes')
            .select('value')
            .eq('seed_id', id)
            .eq('user_id', req.user.id)
            .maybeSingle();

        if (existing && existing.value === value) {
            // Same direction → remove vote
            await supabaseAdmin.from('seed_votes')
                .delete()
                .eq('seed_id', id)
                .eq('user_id', req.user.id);
            return res.json({ success: true, action: 'removed' });
        }

        // Upsert vote
        await supabaseAdmin.from('seed_votes').upsert({
            seed_id: id,
            user_id: req.user.id,
            value,
        }, { onConflict: 'seed_id,user_id' });

        res.json({ success: true, action: existing ? 'changed' : 'added' });
    } catch (err) {
        console.error('Error voting:', err);
        res.status(500).json({ error: 'Failed to vote' });
    }
});

// ─── GET /api/seeds/my-votes ──────────────────────────────────────────────────
// Auth required. Returns user's votes as { [seed_id]: value }.

router.get('/my-votes', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('seed_votes')
            .select('seed_id, value')
            .eq('user_id', req.user.id);

        if (error) throw error;

        const map = Object.fromEntries((data || []).map(v => [v.seed_id, v.value]));
        res.json(map);
    } catch (err) {
        console.error('Error fetching user votes:', err);
        res.status(500).json({ error: 'Failed to fetch votes' });
    }
});

module.exports = router;
