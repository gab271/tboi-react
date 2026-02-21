const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../lib/supabaseAdmin');

/**
 * GET /api/search?q=foo
 */
router.get('/', async (req, res) => {
    const queryTerm = req.query.q;

    if (!queryTerm) {
        return res.json([]);
    }

    try {
        // Use the rpc 'search_items' created in our SQL setup
        // Note: The SQL function 'search_items' returns a table with item columns.
        // We can wrap them in a similar structure to what the frontend expects, or return flat list.
        // The original returned { results: [...] }
        
        const { data, error } = await supabaseAdmin.rpc('search_items', {
            search_query: queryTerm,
            limit_cnt: 20
        });

        if (error) throw error;

        // Map backend DB fields to Frontend expected fields if necessary,
        // but 'search_items' returns (item_type, slug, name, description, tags, icon_url...)
        // which matches well.
        
        res.json({
            results: data.map(item => ({
                type: item.item_type || 'item',
                name: item.name,
                description: item.description,
                icon_url: item.icon_url,
                slug: item.slug || item.id // fallback
            }))
        });

    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
