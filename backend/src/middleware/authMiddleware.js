const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const supabaseAdmin = require('../lib/supabaseAdmin');

dotenv.config();

// We prefer to use the existing supabaseAdmin client if available (uses Service Role).
// This avoids needing the Anon Key in the backend env unless necessary.
// If supabaseAdmin is missing (misconfiguration), we can't authenticate.
const supabase = supabaseAdmin;

function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

const requireAuth = async (req, res, next) => {
  try {
    if (!supabase) {
      console.error('Supabase Client missing in authMiddleware. Check SUPABASE_SERVICE_ROLE_KEY.');
      return res.status(500).json({ error: 'Internal Server Error: Auth configuration missing' });
    }

    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

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

const requireAdmin = (req, res, next) => {
  // Delegates auth to requireAuth, then checks role — sin duplicar lógica
  requireAuth(req, res, () => {
    const role = req.user?.app_metadata?.role;
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  });
};

module.exports = { requireAuth, requireAdmin };
