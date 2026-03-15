require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const { router: authRouter } = require('./auth');
const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ── Trust Railway's proxy (required for secure cookies on Railway) ──────────
app.set('trust proxy', 1);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,       // HTTPS only in production
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',  // 'none' needed for cross-origin on Railway
    maxAge: 30 * 24 * 60 * 60 * 1000   // 30 days
  }
}));

// ── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api', apiRouter);

// ── Catch-all — serve index.html for SPA ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Boot ────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 WhatNext running at http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
