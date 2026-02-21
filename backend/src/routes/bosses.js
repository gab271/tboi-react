const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Load bosses from seed file
const bossesPath = path.join(__dirname, '../../data/bosses.seed.json');
let bosses = [];

try {
    const data = fs.readFileSync(bossesPath, 'utf8');
    bosses = JSON.parse(data);
    // Assign simple IDs if not present (using index or slug)
    bosses = bosses.map((b, index) => ({
        ...b,
        id: b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        pk: index + 1
    }));
    console.log(`Loaded ${bosses.length} bosses from seed.`);
} catch (err) {
    console.error('Error loading bosses seed:', err);
}

/**
 * GET /api/bosses
 * List bosses with pagination and filters
 */
router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 24;
    const search = req.query.search ? req.query.search.toLowerCase() : null;
    const location = req.query.location;
    
    let filtered = bosses;

    // Filter by Search
    if (search) {
        filtered = filtered.filter(b => b.name.toLowerCase().includes(search));
    }

    // Filter by Location
    if (location && location !== 'all') {
        // Location can be partial match or exact
        filtered = filtered.filter(b => b.location && b.location.includes(location));
    }

    // Pagination
    const total = filtered.length;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const paginated = filtered.slice(from, to);

    res.json({
        data: paginated,
        meta: {
            page,
            pageSize,
            total
        }
    });
});

/**
 * GET /api/bosses/locations
 * Get list of unique locations for filtering
 */
router.get('/locations', (req, res) => {
    const locations = new Set();
    bosses.forEach(b => {
        if (b.location) {
             locations.add(b.location);
        }
    });
    res.json(Array.from(locations).sort());
});

/**
 * GET /api/bosses/:id
 * Get single boss details
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const boss = bosses.find(b => b.id === id || b.pk.toString() === id);

    if (!boss) {
        return res.status(404).json({ error: 'Boss not found' });
    }

    res.json(boss);
});

module.exports = router;
