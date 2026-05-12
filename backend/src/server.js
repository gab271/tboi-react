const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { apiLimiter, saveLimiter, voteLimiter, adminLimiter } = require('./middleware/rateLimiter');

const itemsRoutes      = require('./routes/items');
const bossesRoutes     = require('./routes/bosses');
const searchRoutes     = require('./routes/search');
const authAdminRoutes  = require('./routes/auth-admin');
const adminItemsRoutes = require('./routes/admin-items');
const saveRoutes       = require('./routes/save');
const { router: statsRoutes } = require('./routes/stats');
const synergiesRoutes  = require('./routes/synergies');
const activityRoutes   = require('./routes/activity');
const marksRoutes      = require('./routes/marks');
const progressRoutes   = require('./routes/progress');
const tierlistRoutes   = require('./routes/tierlist');
const seedsRoutes      = require('./routes/seeds');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const IS_PROD = process.env.NODE_ENV === 'production';

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // API puro JSON, sin HTML servido
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // necesario para imágenes Supabase Storage
}));

// ── Logging ─────────────────────────────────────────────────────────────────
// 'combined' en prod (incluye IP + UA para auditoría), 'dev' en local
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [FRONTEND_ORIGIN];
if (!IS_PROD) {
  allowedOrigins.push('http://localhost:5173');
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-File-SHA256'],
  credentials: true,
}));

// ── Rate limiting global (backstop para todo lo demás) ───────────────────────
app.use(apiLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rutas con rate limiters específicos ──────────────────────────────────────
app.use('/api/save',        saveLimiter,  saveRoutes);
app.use('/api/seeds',       voteLimiter,  seedsRoutes);
app.use('/api/tierlist',    voteLimiter,  tierlistRoutes);
app.use('/api/admin/items', adminLimiter, adminItemsRoutes);
app.use('/api/admin',       adminLimiter, authAdminRoutes);

// ── Rutas estándar ────────────────────────────────────────────────────────────
app.use('/api/items',      itemsRoutes);
app.use('/api/bosses',     bossesRoutes);
app.use('/api/search',     searchRoutes);
app.use('/api/stats',      statsRoutes);
app.use('/api/synergies',  synergiesRoutes);
app.use('/api/activity',   activityRoutes);
app.use('/api/users',      marksRoutes);
app.use('/api/users',      progressRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
// Captura cualquier error no manejado antes de que llegue al cliente con stack trace
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]', err);
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

// ── Servidor ──────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} [${IS_PROD ? 'production' : 'development'}]`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`  Windows: taskkill /IM node.exe /F`);
    console.error(`  Mac/Linux: pkill -f node`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
