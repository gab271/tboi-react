const rateLimit = require('express-rate-limit');

const base = {
  standardHeaders: true,
  legacyHeaders: false,
};

// General API — 100 req / 15 min
const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

// File upload (/api/save) — 5 req / min
const saveLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many file uploads, please slow down.' },
});

// Voting (/api/seeds, /api/tierlist) — 60 req / 15 min
const voteLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many votes, please slow down.' },
});

// Admin endpoints — 20 req / 15 min
const adminLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many admin requests.' },
});

module.exports = { apiLimiter, saveLimiter, voteLimiter, adminLimiter };
