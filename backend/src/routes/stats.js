/**
 * Stats Routes
 * GET /api/stats/today - Get daily statistics
 */

const express = require('express');
const router = express.Router();

// In-memory counter for demo purposes
// In production, this would come from database
let dailyAnalyzeCount = 0;
let lastResetDate = new Date().toDateString();

// Increment counter function (called from save route)
function incrementAnalyzeCount() {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        // Reset counter at midnight
        dailyAnalyzeCount = 0;
        lastResetDate = today;
    }
    dailyAnalyzeCount++;
    return dailyAnalyzeCount;
}

// Get current count
function getAnalyzeCount() {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
        dailyAnalyzeCount = 0;
        lastResetDate = today;
    }
    return dailyAnalyzeCount;
}

/**
 * GET /api/stats/today
 * Returns today's statistics
 */
router.get('/today', (req, res) => {
    // Base count (simulated starting point to look active)
    const baseCount = Math.floor(Math.random() * 500) + 1500; // 1500-2000 base
    const actualCount = getAnalyzeCount();
    
    res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    
    res.json({
        ok: true,
        stats: {
            analyzedToday: baseCount + actualCount,
            activeUsers: Math.floor((baseCount + actualCount) * 0.4), // ~40% unique users estimate
            updatedAt: new Date().toISOString()
        }
    });
});

module.exports = {
    router,
    incrementAnalyzeCount,
    getAnalyzeCount
};
