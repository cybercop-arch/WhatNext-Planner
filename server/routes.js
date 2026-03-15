const express = require('express');
const { pool } = require('./db');
const { requireAuth } = require('./auth');
const router = express.Router();

// All routes require auth
router.use(requireAuth);

// ═══════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════

// GET /api/tasks?date=YYYY-MM-DD
router.get('/tasks', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id=$1 AND date_key=$2 ORDER BY created_at ASC',
      [req.session.userId, date || todayKey()]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tasks
router.post('/tasks', async (req, res) => {
  const { name, urgency, duration, deadline, date_key } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks(user_id,name,urgency,duration,deadline,date_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.session.userId, name, urgency||'medium', duration||30, deadline||'', date_key||todayKey()]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/tasks/:id
router.patch('/tasks/:id', async (req, res) => {
  const { done, urgency, duration, deadline, name } = req.body;
  try {
    const fields = []; const vals = []; let i = 1;
    if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name); }
    if (done !== undefined) { fields.push(`done=$${i++}`); vals.push(done); }
    if (urgency !== undefined) { fields.push(`urgency=$${i++}`); vals.push(urgency); }
    if (duration !== undefined) { fields.push(`duration=$${i++}`); vals.push(duration); }
    if (deadline !== undefined) { fields.push(`deadline=$${i++}`); vals.push(deadline); }
    if (!fields.length) return res.json({ ok: true });
    fields.push(`updated_at=NOW()`);
    vals.push(req.params.id, req.session.userId);
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(',')} WHERE id=$${i++} AND user_id=$${i} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════════

// GET /api/schedule?date=YYYY-MM-DD
router.get('/schedule', async (req, res) => {
  const { date } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM schedule_blocks WHERE user_id=$1 AND date_key=$2 ORDER BY sort_order ASC, start_time ASC',
      [req.session.userId, date || todayKey()]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/schedule (replace entire schedule for a date)
router.post('/schedule', async (req, res) => {
  const { date_key, blocks, summary } = req.body;
  const dk = date_key || todayKey();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM schedule_blocks WHERE user_id=$1 AND date_key=$2', [req.session.userId, dk]);
    const inserted = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const r = await client.query(
        `INSERT INTO schedule_blocks(user_id,date_key,start_time,end_time,title,urgency,duration_min,why,is_break,doing_now,done,sort_order)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [req.session.userId, dk, b.start, b.end, b.title, b.urgency||'medium', b.duration_min||30,
         b.why||'', b.is_break||false, b.doing_now||false, b.done||false, i]
      );
      inserted.push(r.rows[0]);
    }
    await client.query('COMMIT');
    res.json(inserted);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// PATCH /api/schedule/:id
router.patch('/schedule/:id', async (req, res) => {
  const { done, doing_now } = req.body;
  try {
    const fields = []; const vals = []; let i = 1;
    if (done !== undefined) { fields.push(`done=$${i++}`); vals.push(done); }
    if (doing_now !== undefined) { fields.push(`doing_now=$${i++}`); vals.push(doing_now); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(req.params.id, req.session.userId);
    const result = await pool.query(
      `UPDATE schedule_blocks SET ${fields.join(',')} WHERE id=$${i++} AND user_id=$${i} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/schedule/bulk/:dateKey — update all doing_now flags
router.patch('/schedule/bulk/:dateKey', async (req, res) => {
  const { updates } = req.body; // [{id, doing_now, done}]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const u of updates) {
      await client.query(
        'UPDATE schedule_blocks SET doing_now=$1, done=$2 WHERE id=$3 AND user_id=$4',
        [u.doing_now, u.done, u.id, req.session.userId]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

// ═══════════════════════════════════════════════
// WEEK GOALS (day-assigned goals)
// ═══════════════════════════════════════════════

// GET /api/week-goals?week=YYYY-Www  OR  ?month=YYYY-MM
router.get('/week-goals', async (req, res) => {
  const { week, month } = req.query;
  try {
    let result;
    if (month) {
      // Get all day goals in a given month (for calendar view)
      result = await pool.query(
        `SELECT * FROM week_goals WHERE user_id=$1 AND day_key LIKE $2 ORDER BY created_at ASC`,
        [req.session.userId, month + '%']
      );
    } else if (week) {
      result = await pool.query(
        'SELECT * FROM week_goals WHERE user_id=$1 AND (week_key=$2 OR day_key LIKE $3) ORDER BY created_at ASC',
        [req.session.userId, week, week.slice(0,4) + '%']
      );
    } else {
      result = await pool.query(
        'SELECT * FROM week_goals WHERE user_id=$1 ORDER BY created_at ASC',
        [req.session.userId]
      );
    }
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/week-goals
router.post('/week-goals', async (req, res) => {
  const { title, category, priority, week_key, day_key, month_goal_ref } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO week_goals(user_id,title,category,priority,week_key,day_key,month_goal_ref)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.session.userId, title, category||'personal', priority||'medium',
       week_key||'', day_key||'', month_goal_ref||null]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/week-goals/:id
router.patch('/week-goals/:id', async (req, res) => {
  const { done, title, category, priority } = req.body;
  try {
    const fields = []; const vals = []; let i = 1;
    if (done !== undefined) { fields.push(`done=$${i++}`); vals.push(done); }
    if (title !== undefined) { fields.push(`title=$${i++}`); vals.push(title); }
    if (category !== undefined) { fields.push(`category=$${i++}`); vals.push(category); }
    if (priority !== undefined) { fields.push(`priority=$${i++}`); vals.push(priority); }
    if (!fields.length) return res.json({ ok: true });
    fields.push(`updated_at=NOW()`);
    vals.push(req.params.id, req.session.userId);
    const result = await pool.query(
      `UPDATE week_goals SET ${fields.join(',')} WHERE id=$${i++} AND user_id=$${i} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/week-goals/:id
router.delete('/week-goals/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM week_goals WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════
// MONTH GOALS
// ═══════════════════════════════════════════════

// GET /api/month-goals?month=YYYY-MM
router.get('/month-goals', async (req, res) => {
  const { month } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM month_goals WHERE user_id=$1 AND month_key=$2 ORDER BY created_at ASC',
      [req.session.userId, month]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/month-goals
router.post('/month-goals', async (req, res) => {
  const { title, description, category, progress, month_key } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO month_goals(user_id,title,description,category,progress,month_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.session.userId, title, description||'', category||'personal', progress||0, month_key]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/month-goals/:id
router.patch('/month-goals/:id', async (req, res) => {
  const { title, description, category, progress } = req.body;
  try {
    const fields = []; const vals = []; let i = 1;
    if (title !== undefined) { fields.push(`title=$${i++}`); vals.push(title); }
    if (description !== undefined) { fields.push(`description=$${i++}`); vals.push(description); }
    if (category !== undefined) { fields.push(`category=$${i++}`); vals.push(category); }
    if (progress !== undefined) { fields.push(`progress=$${i++}`); vals.push(progress); }
    if (!fields.length) return res.json({ ok: true });
    fields.push(`updated_at=NOW()`);
    vals.push(req.params.id, req.session.userId);
    const result = await pool.query(
      `UPDATE month_goals SET ${fields.join(',')} WHERE id=$${i++} AND user_id=$${i} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/month-goals/:id
router.delete('/month-goals/:id', async (req, res) => {
  try {
    // Also remove linked week_goals
    await pool.query('DELETE FROM week_goals WHERE month_goal_ref=$1 AND user_id=$2', [req.params.id, req.session.userId]);
    await pool.query('DELETE FROM month_goals WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════
// AI PROXY (keeps API key server-side)
// ═══════════════════════════════════════════════

// POST /api/ai
router.post('/ai', async (req, res) => {
  const { prompt, max_tokens } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content.map(b => b.text || '').join('');
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'AI request failed: ' + err.message });
  }
});

// Utility
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

module.exports = router;
