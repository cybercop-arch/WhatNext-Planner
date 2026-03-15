const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');
const router = express.Router();

// Middleware: require auth
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users(email,password,name) VALUES($1,$2,$3) RETURNING id,email,name,theme,energy',
      [email.toLowerCase(), hash, name || '']
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.save();
    res.json({ user: { id: user.id, email: user.email, name: user.name, theme: user.theme, energy: user.energy } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user.id;
    req.session.save();
    res.json({ user: { id: user.id, email: user.email, name: user.name, theme: user.theme, energy: user.energy } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,email,name,theme,energy FROM users WHERE id=$1',
      [req.session.userId]
    );
    if (!result.rows.length) return res.status(401).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/preferences
router.patch('/preferences', requireAuth, async (req, res) => {
  const { theme, energy } = req.body;
  try {
    const fields = [];
    const vals = [];
    let i = 1;
    if (theme !== undefined) { fields.push(`theme=$${i++}`); vals.push(theme); }
    if (energy !== undefined) { fields.push(`energy=$${i++}`); vals.push(energy); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(req.session.userId);
    await pool.query(`UPDATE users SET ${fields.join(',')} WHERE id=$${i}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, requireAuth };
