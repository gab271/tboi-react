const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const rateLimit = require('./middleware/rateLimiter');
// const isaacRoutes = require('./routes/isaac'); // REMOVED
const itemsRoutes = require('./routes/items');
const bossesRoutes = require('./routes/bosses');
const searchRoutes = require('./routes/search');
const authAdminRoutes = require('./routes/auth-admin');
const adminItemsRoutes = require('./routes/admin-items');
const saveRoutes = require('./routes/save');
const { router: statsRoutes } = require('./routes/stats');
const synergiesRoutes = require('./routes/synergies');
const activityRoutes = require('./routes/activity');
const marksRoutes = require('./routes/marks');
const progressRoutes = require('./routes/progress');
const tierlistRoutes = require('./routes/tierlist');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// CORS
app.use(cors({
  origin: [FRONTEND_ORIGIN, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate Limit
app.use(rateLimit);

app.get('/', (req, res) => {
  res.send('TBOI Codex Backend Running');
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// app.use('/api/isaac', isaacRoutes); // REMOVED
app.use('/api/items', itemsRoutes);
app.use('/api/bosses', bossesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/save', saveRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/synergies', synergiesRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/users', marksRoutes);
app.use('/api/users', progressRoutes);
app.use('/api/tierlist', tierlistRoutes);
// Mount specific admin sub-routes first
app.use('/api/admin/items', adminItemsRoutes);
// Mount general admin routes (stats, users, promote)
app.use('/api/admin', authAdminRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill existing process with:`);
    console.error(`  Windows: taskkill /IM node.exe /F`);
    console.error(`  Mac/Linux: pkill -f node`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
