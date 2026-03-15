const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected');
    release();
  }
});

const SCHEMA = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(255),
    theme       VARCHAR(10) DEFAULT 'girl',
    energy      VARCHAR(10) DEFAULT '',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );

  -- Tasks (today's task list)
  CREATE TABLE IF NOT EXISTS tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(500) NOT NULL,
    urgency     VARCHAR(20) DEFAULT 'medium',
    duration    INTEGER DEFAULT 30,
    deadline    VARCHAR(100) DEFAULT '',
    done        BOOLEAN DEFAULT false,
    date_key    VARCHAR(12) NOT NULL,  -- YYYY-MM-DD for which day
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );

  -- Schedule blocks (AI-generated daily schedule)
  CREATE TABLE IF NOT EXISTS schedule_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_key    VARCHAR(12) NOT NULL,
    start_time  VARCHAR(10),
    end_time    VARCHAR(10),
    title       VARCHAR(500),
    urgency     VARCHAR(20),
    duration_min INTEGER,
    why         TEXT,
    is_break    BOOLEAN DEFAULT false,
    doing_now   BOOLEAN DEFAULT false,
    done        BOOLEAN DEFAULT false,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
  );

  -- Week goals (assigned to specific days)
  CREATE TABLE IF NOT EXISTS week_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    category        VARCHAR(50) DEFAULT 'personal',
    priority        VARCHAR(20) DEFAULT 'medium',
    done            BOOLEAN DEFAULT false,
    week_key        VARCHAR(12) DEFAULT '',  -- YYYY-Www
    day_key         VARCHAR(12) DEFAULT '',  -- YYYY-MM-DD
    month_goal_ref  UUID REFERENCES month_goals(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
  );

  -- Month goals (big goals for a month)
  CREATE TABLE IF NOT EXISTS month_goals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    category    VARCHAR(50) DEFAULT 'personal',
    progress    INTEGER DEFAULT 0,
    month_key   VARCHAR(8) NOT NULL,  -- YYYY-MM
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date_key);
  CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON schedule_blocks(user_id, date_key);
  CREATE INDEX IF NOT EXISTS idx_week_goals_user ON week_goals(user_id);
  CREATE INDEX IF NOT EXISTS idx_month_goals_user_month ON month_goals(user_id, month_key);
`;

// Note: month_goals must exist before week_goals due to foreign key
// Split and run in correct order
const SCHEMA_PARTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    theme VARCHAR(10) DEFAULT 'girl',
    energy VARCHAR(10) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'medium',
    duration INTEGER DEFAULT 30,
    deadline VARCHAR(100) DEFAULT '',
    done BOOLEAN DEFAULT false,
    date_key VARCHAR(12) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS schedule_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_key VARCHAR(12) NOT NULL,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    title VARCHAR(500),
    urgency VARCHAR(20),
    duration_min INTEGER,
    why TEXT,
    is_break BOOLEAN DEFAULT false,
    doing_now BOOLEAN DEFAULT false,
    done BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS month_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) DEFAULT 'personal',
    progress INTEGER DEFAULT 0,
    month_key VARCHAR(8) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS week_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) DEFAULT 'personal',
    priority VARCHAR(20) DEFAULT 'medium',
    done BOOLEAN DEFAULT false,
    week_key VARCHAR(12) DEFAULT '',
    day_key VARCHAR(12) DEFAULT '',
    month_goal_ref UUID REFERENCES month_goals(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date_key)`,
  `CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON schedule_blocks(user_id, date_key)`,
  `CREATE INDEX IF NOT EXISTS idx_week_goals_user ON week_goals(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_month_goals_user_month ON month_goals(user_id, month_key)`
];

async function initDB() {
  const client = await pool.connect();
  try {
    for (const sql of SCHEMA_PARTS) {
      await client.query(sql);
    }
    console.log('✅ Database schema ready');
  } catch (err) {
    console.error('❌ Schema init error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };
