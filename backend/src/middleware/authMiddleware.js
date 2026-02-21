const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const supabaseAdmin = require('../lib/supabaseAdmin');

dotenv.config();

// We prefer to use the existing supabaseAdmin client if available (uses Service Role).
// This avoids needing the Anon Key in the backend env unless necessary.
// If supabaseAdmin is missing (misconfiguration), we can't authenticate.
const supabase = supabaseAdmin;

const requireAuth = async (req, res, next) => {
  try {
    if (!supabase) {
        console.error('Supabase Client missing in authMiddleware. Check SUPABASE_SERVICE_ROLE_KEY.');
        return res.status(500).json({ error: 'Internal Server Error: Auth configuration missing' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // First ensure auth
    if (!req.user) {
        // If requireAuth wasn't called before, call logic here
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) return res.status(401).json({ error: 'Invalid token' });
        req.user = user;
    }

    // Check custom claim
    const role = req.user.app_metadata?.role;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    next();
  } catch (err) {
    console.error('Admin Middleware Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { requireAuth, requireAdmin };
