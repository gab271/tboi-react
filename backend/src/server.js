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
// Mount specific admin sub-routes first
app.use('/api/admin/items', adminItemsRoutes);
// Mount general admin routes (stats, users, promote)
app.use('/api/admin', authAdminRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
