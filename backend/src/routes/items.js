const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabaseAdmin');

/**
 * GET /api/items
 * List items with pagination and filters
 */
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 24;
    const type = req.query.type; // filter by item_type
    const search = req.query.search; // search term
    const ids = req.query.ids; // comma separated ids
    const quality = req.query.quality; // comma separated quality tiers (0,1,2,3,4)
    
    // Calculate range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
        let query = supabaseAdmin
            .from('codex_items')
            .select('*', { count: 'exact' })
            .eq('is_published', true)
            .order('name', { ascending: true });

        if (ids) {
            const idList = ids.split(',');
            query = query.in('id', idList);
        }

        if (type && type !== 'all') {
            query = query.eq('item_type', type);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Filter by quality tiers
        if (quality) {
            const qualityLevels = quality.split(',').map(q => parseInt(q)).filter(q => !isNaN(q));
            if (qualityLevels.length > 0) {
                query = query.in('quality', qualityLevels);
            }
        }
        
        // Apply pagination last
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;

        // Map sprite_url to image for frontend compatibility
        const mappedData = data.map(item => ({
            ...item,
            image: item.sprite_url
        }));

        res.json({
            data: mappedData,
            meta: {
                page,
                pageSize,
                total: count
            }
        });

    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

/**
 * GET /api/items/random
 * Get N random items
 */
router.get('/random', async (req, res) => {
    const n = parseInt(req.query.n) || 3;
    
    try {
        const { data, error } = await supabaseAdmin.rpc('get_random_items', { limit_cnt: n });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error fetching random items:', err);
        res.status(500).json({ error: 'Failed to fetch random items' });
    }
});

/**
 * GET /api/items/:slug
 * Get single item details by Slug OR ID
 */
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;

    // Check if it's a numeric ID
    const isId = /^\d+$/.test(slug);

    try {
        let query = supabaseAdmin
            .from('codex_items')
            .select('*')
            .eq('is_published', true);

        if (isId) {
             query = query.eq('external_id', parseInt(slug));
        } else {
             query = query.eq('slug', slug);
        }
            
        const { data, error } = await query.single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                return res.status(404).json({ error: 'Item not found' });
            }
            throw error;
        }

        res.json(data);

    } catch (err) {
        console.error('Error fetching item:', err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

module.exports = router;
