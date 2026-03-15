# WhatNext ✦ Day Planner

> *Most people aren't lazy — they're just stuck. WhatNext gives you one clear next action based on your goals, time, and energy.*

A beautiful, AI-powered productivity planner that helps you plan your **day**, **week**, and **month** — all in a single HTML file. No installs, no accounts, no backend. Just open and go.

---

## ✦ Live Demo

🔗 **[your-username.github.io/whatnext-planner](https://your-username.github.io/whatnext-planner)**

---

## ✦ What It Does

WhatNext is three planners in one:

| View | What you get |
|------|-------------|
| **Today** | AI builds a time-blocked schedule from your tasks, matched to your energy level |
| **This Week** | 7-day grid to assign goals to specific days + a weekly goals tracker |
| **This Month** | Full calendar view — click any date to assign monthly goals to it |

---

## ✦ Features

**Two themes — pick your aesthetic**

- 🌸 **Soft & Sweet** — blush pink, Playfair Display italic headings, delicate and cozy
- ☕ **Warm & Sharp** — dark espresso, amber accents, clean and focused

**Smart daily planning**
- Add tasks with urgency levels (Critical → Low) and drag a slider to set how long you want to spend
- Set your energy level (Low / Medium / High) — the AI uses this to order your day
- Hit *Plan My Day* and get a full time-blocked schedule with a "Do this right now" spotlight
- Mark tasks done one by one, mood strip updates as you progress

**Three ways to add tasks**
- Quick-add with Enter key
- Brain dump — paste a wall of text, AI extracts all tasks with urgency and duration
- Voice input — speak your tasks, AI parses them

**Weekly planner**
- Drag-and-drop goals onto specific days of the week
- Separate weekly goals list with categories and priority levels
- Navigate forwards and backwards through weeks

**Monthly planner**
- Full calendar grid with colored dot indicators per category
- Click any date to open a side panel and assign goals to that day
- Create big monthly goals, then break them down day by day
- Progress bars auto-update as you complete daily assignments

**Everything persists** — all tasks, goals, and schedules save to `localStorage` and survive page refresh.

---

## ✦ Tech Stack

| | |
|--|--|
| **Framework** | Vanilla HTML/CSS/JS — zero dependencies |
| **AI** | Anthropic Claude API (`claude-sonnet-4`) |
| **Storage** | Browser `localStorage` |
| **Fonts** | Google Fonts (Playfair Display, DM Sans, Syne, Space Grotesk) |
| **Hosting** | GitHub Pages (or any static host) |

---

## ✦ Getting Started

### Option A — Just open it
Download `index.html` and open it in any browser. Done.

### Option B — GitHub Pages (free hosting)

1. Fork or clone this repo
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your app is live at `https://YOUR-USERNAME.github.io/whatnext-planner`

### Option C — Add your own API key

The AI features (plan generation, brain dump parsing) call the Anthropic API. To use with your own key, find this line in `index.html`:

```js
const r = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... })
});
```

Add your key to the headers:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'sk-ant-YOUR-KEY-HERE',
  'anthropic-version': '2023-06-01'
},
```

> ⚠️ Never commit your API key to a public repo. Consider using environment variables or a small backend proxy if deploying publicly.

---

## ✦ Screenshots

| Soft & Sweet 🌸 | Warm & Sharp ☕ |
|---|---|
| Pink theme, italic headings | Dark espresso, amber accents |

*(Replace with actual screenshots after deploying)*

---

## ✦ Roadmap

- [ ] Google Calendar sync
- [ ] Recurring tasks
- [ ] Export schedule as PDF
- [ ] Shared goals / collaboration
- [ ] Mobile app wrapper (PWA)

---

## ✦ License

MIT — use it, modify it, ship it. Credit appreciated but not required.

---

<div align="center">
  <p>Built with Claude · Anthropic API · No frameworks, no fuss</p>
  <p><em>Not a productivity app — a clarity tool.</em></p>
</div>
