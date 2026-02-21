const express = require('express');
const router = express.Router();
const fs = require('fs'); // Added for local stats
const path = require('path'); // Added for local stats
const supabaseAdmin = require('../lib/supabaseAdmin');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// ==========================================
// ADMIN DASHBOARD ROUTES
// ==========================================

// GET Global Stats (Users, Items, etc.)
router.get('/stats', requireAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Admin service unavailable' });

  try {
    // 1. Total Users (from auth.users - requires service role)
    // ListUsers with pagination to count total (not efficient for millions, but fine for now)
    // or use a direct SQL query via RPC if available. 
    // supabaseAdmin.auth.listUsers({ page: 1, perPage: 1 }) returns total usually in metadata? No.
    // We'll traverse or just assume we have < 1000 for now or use rpc get_admin_stats
    
    // Better: Fetch RPC get_admin_stats if implemented, BUT rpc runs as the user who calls it?
    // supabaseAdmin calls RPC as service role which bypasses RLS? Yes.
    
    // Let's try to count users purely via Auth API (slow if many) or assume RPC is cleaner.
    // User requested "Edge Function admin-stats using service role".
    // We will do parallel queries.
    
    // Use .admin namespace for user management in v2
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    const totalUsers = users ? users.length : 0; // Note: listUsers defaults to 50.Need to page for real total.

    // 2. Content counts (RLS policies allow read, but we use admin client to be sure/fast)
    // We read bosses from local JSON since we updated it locally
    let localBossCount = 0;
    try {
        const bossesPath = path.join(__dirname, '../../data/bosses.seed.json');
        const bData = JSON.parse(fs.readFileSync(bossesPath, 'utf8'));
        localBossCount = bData.length;
    } catch (e) {
        console.error("Stats: Error reading local bosses", e);
    }

    const [items, /* bosses */, characters, builds] = await Promise.all([
      supabaseAdmin.from('codex_items').select('*', { count: 'exact', head: true }),
      // Skip supabase bosses: supabaseAdmin.from('codex_bosses').select('*', { count: 'exact', head: true }),
      Promise.resolve({ count: 0 }), // Placeholder to keep array destructuring simple
      supabaseAdmin.from('codex_characters').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('builds').select('*', { count: 'exact', head: true })
    ]);

    res.json({
      totalUsers, // Approximate if > 50
      totalItems: items.count || 0,
      totalBosses: localBossCount, // UPDATED: Use local JSON count
      totalCharacters: characters.count || 0,
      totalBuilds: builds.count || 0
    });

  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST Promote User to Admin
router.post('/promote', requireAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(503).json({ error: 'Config Error' });
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { app_metadata: { role: 'admin' } }
    );

    if (error) throw error;
    res.json({ message: 'User promoted successfully', user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET List All Users (with pagination)
router.get('/users', requireAdmin, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Config Error' });

    try {
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
        if (error) throw error;

        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE User (Admin Action)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    if (!supabaseAdmin) return res.status(503).json({ error: 'Config Error' });
    const { id } = req.params;

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) throw error;
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// USER SELF-MANAGEMENT
// ==========================================

// Delete User Account (Protected by Frontend JWT)
router.delete('/delete-account', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Server misconfiguration: Admin keys missing' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // verify the token with Supabase Auth to get the User ID safely
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // If valid, use Admin Client to delete the user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`User ${user.id} deleted successfully.`);
    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
