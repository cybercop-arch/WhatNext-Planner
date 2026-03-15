<div align="center">

# ✦ WhatNext

### *Most people aren't lazy — they're just stuck.*
### *WhatNext gives you one clear answer: what to do right now.*

<br/>

An AI-powered planner that helps you organise your **day**, **week**, and **month** — with a beautiful interface that actually makes you want to use it.

<br/>

![Version](https://img.shields.io/badge/version-1.0.0-pink?style=flat-square)
![Node](https://img.shields.io/badge/node-18+-brown?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## ✦ What is WhatNext?

WhatNext is a personal productivity planner with three views in one app:

| View | What it does |
|------|-------------|
| 🗓 **Today** | Add your tasks, set how long you want to spend on each, tell it your energy level — and it builds you a complete time-blocked schedule using AI |
| 📅 **This Week** | Plan your week day by day. Assign goals to specific days, track weekly objectives by category |
| 🗓 **This Month** | Set big monthly goals and assign them to specific dates on a calendar. Watch your progress grow |

Everything saves to your account. Close the tab, come back tomorrow — it's all still there.

---

## ✦ Choose Your Aesthetic

When you first open the app, pick your vibe:

🌸 **Soft & Sweet** — blush pink, italic headings, cozy and elegant

☕ **Warm & Sharp** — dark espresso tones, amber accents, clean and focused

You can switch anytime from the top navigation.

---

## ✦ Getting Started

### 1. Create an account
Click **Sign Up**, enter your name, email, and a password (min 6 characters). No email verification, no waiting.

### 2. Pick your theme
Choose between **Soft & Sweet** (pink) or **Warm & Sharp** (dark brown). Saved to your account permanently.

### 3. Add your tasks
There are four ways to get tasks into the app:

**Quick add** — Type in the sidebar and press `Enter`

**Detail add** — Click the `＋` button to set urgency, deadline, and exactly how long you want to spend

**Brain dump** — Click *Import Tasks → Brain Dump*, paste everything on your mind in one go:
> *"finish the report by 5pm, call dentist, reply to Raj's email, gym, pay rent, prep for Tuesday meeting"*

The AI automatically splits it into structured tasks with urgency and duration guessed for each one.

**Voice** — Click *Import Tasks → Voice*, speak your tasks out loud, then hit Parse.

---

## ✦ Planning Your Day

### Set your tasks
Each task has:
- **Urgency** — Critical (due today), High (due soon), Medium (this week), Low (someday)
- **Duration** — Drag the slider to set how long *you want to spend* on it. 15 min? 2 hours? You decide. This is not how long it takes — it's how long you're allocating.
- **Deadline** — Optional. E.g. "3pm", "EOD", "before lunch"

### Set your energy level
Before planning, tell the app how you're feeling right now:

| Energy | What happens |
|--------|-------------|
| 😴 Low | Tired, foggy. AI starts you with something easy to build momentum, avoids long deep-work blocks |
| 😐 Medium | Steady and functional. Mix of demanding and lighter tasks |
| 🔥 High | Sharp and ready. Hardest, most important task goes first — Eat the Frog |

### Hit Plan My Day
Click the **Plan My Day** button. The AI builds a full time-blocked schedule for the rest of your day — respecting the time you allocated for each task, ordering by urgency and your energy, and automatically adding short breaks after every 90 minutes of work.

### The "Do This Right Now" spotlight
At the top of your schedule there is always one highlighted task in a glowing box. That is the thing you should be doing right now. No confusion, no deciding. Just start.

### Mark tasks done
Click **✓ Done** on any block as you complete it. The spotlight automatically moves to the next task. A mood indicator at the top of the screen reflects how your day is going:

- Starting out → encouraging nudge to begin
- Halfway done → telling you you're crushing it
- All done → celebration 🎉

---

## ✦ Weekly Planner

Switch to **This Week** in the top navigation bar.

### Day grid
Seven columns, one per day of the week. Click the `＋` on any day to quickly drop a goal onto that date. Goals show up as small checklist items inside the day cell.

### Weekly goals
Bigger goals that apply to the whole week rather than one specific day. Click **+ Add Goal** and give it:
- A title
- A category — Work, Health, Learn, Personal, Finance, or Social
- A priority — High, Medium, or Low

Check them off as you complete them. Navigate between weeks with **← Prev** and **Next →**.

---

## ✦ Monthly Planner

Switch to **This Month** in the top navigation bar.

### Calendar view
The full month grid shows coloured dots on each date — each colour represents a goal category. At a glance you can see which days are busy and which are empty.

### Click any date to open the Day Panel
This is the heart of the monthly planner. Click any date and a panel slides in from the right with three sections:

**1. Goals for this day**
All goals currently assigned to that date, each with a checkbox. Mark them done right from the panel.

**2. Quick add**
Type directly in the panel and press Enter to create a brand new goal just for that date.

**3. Assign from monthly goals**
Your big monthly goals appear as a picker list at the bottom. Hit **+ Assign** to link a monthly goal to that specific day. Once assigned it shows a green tick. This is how you break a big goal down into daily actions.

### Monthly goals
Add your big goals for the month with **+ Add Goal**. Each goal has:
- A title and optional description explaining why it matters
- A category with a matching colour
- A progress bar — click it to manually update the percentage

When you complete a goal that was assigned from a monthly goal, the monthly goal's progress bar automatically updates based on how many of its daily assignments are done.

---

## ✦ Tips

**The slider is the most important thing.** Don't leave everything at 30 minutes. Be honest about how long you're actually willing to spend. If you only have 20 minutes for something, set it to 20. The schedule becomes much more realistic.

**Brain dump first, organise later.** If you're overwhelmed, open Brain Dump and just type everything. Don't think. Don't format. Just empty your brain into the text box and let the AI sort it.

**Use the monthly → weekly → daily flow:**
1. Start of month — set your 3 to 5 big monthly goals
2. Start of each week — open the calendar, click days, assign those monthly goals to specific dates
3. Each morning — add today's tasks, set energy, plan the day

**Critical urgency is not a feeling — it means today.** Reserve it for tasks with a real hard deadline today. If everything is critical, nothing is.

**Low energy days are valid.** Don't skip planning on tired days — that's exactly when you need it most. Set energy to Low and let the app give you an easy start.

---

## ✦ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit quick-add task or panel input |
| `Escape` | Close any open modal or side panel |

---

## ✦ Your Data

Everything is saved to your account in a PostgreSQL database:

- Today's tasks (stored per date)
- AI-generated time-blocked schedules
- Weekly goals and day assignments
- Monthly goals with progress tracking
- Your theme preference and energy level

Nothing is stored in the browser. Log in from your phone, laptop, or any device and see the exact same data.

---

## ✦ For Developers — Running Locally

### Requirements
- Node.js 18+
- PostgreSQL

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/whatnext-planner
cd whatnext-planner

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Edit `.env` with your values:
```
DATABASE_URL=postgresql://localhost:5432/whatnext
SESSION_SECRET=any-long-random-string-minimum-32-chars
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3000
NODE_ENV=development
```

```bash
# Create the database
createdb whatnext

# Start the server — tables are created automatically on first run
npm start
```

Open **http://localhost:3000**

### Project structure

```
whatnext-planner/
├── server/
│   ├── index.js        Express server entry point
│   ├── db.js           PostgreSQL connection and schema
│   ├── auth.js         Register, login, logout, session
│   └── routes.js       All API routes and AI proxy
├── public/
│   └── index.html      Complete frontend — one file
├── .env.example        Environment variable template (safe to commit)
├── .gitignore          Blocks .env and node_modules
└── package.json
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret for signing session cookies |
| `ANTHROPIC_API_KEY` | ✅ | Your Claude API key — stays server-side |
| `PORT` | Optional | Defaults to 3000 |
| `NODE_ENV` | Optional | Set to `production` when deploying |

> ⚠️ Never commit your `.env` file. The `.gitignore` already blocks it, but double check before pushing.

---

## ✦ Tech Stack

| | |
|--|--|
| **Frontend** | Vanilla HTML, CSS, JavaScript — no framework |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Auth** | express-session + bcryptjs |
| **AI** | Anthropic Claude API (server-side proxy — key never exposed to browser) |
| **Fonts** | Playfair Display, DM Sans, Syne, Space Grotesk |

---

<div align="center">

Made with [Claude](https://anthropic.com) · MIT License

*Not a productivity app — a clarity tool.*

</div>
