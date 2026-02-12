# Sales Race Tracker

Sales Race Tracker is a premium-feel, single-page personal tracker for car salespeople. It is **not** a CRM replacement; it is built for motivation, fast logging, and personal momentum tracking.

## What it includes

- First-run profile setup (name, nickname, accent theme, Race Mode toggle)
- Monthly season model (`YYYY-MM`) with current month auto-created
- Season selector with historical months + all-time view
- Quick logging flow (date, sale type, value, optional notes)
- Points engine with configurable rules
- Driver tier progression (`+1 tier / 1000 points`)
- Momentum and best momentum streaks
- Premium badge system (season + all-time)
- Race Mode terminology + F1-inspired visual theme
- Full persistence in `localStorage`

## Run locally

### Option 1: Open directly
Open `index.html` in your browser.

### Option 2: Serve statically (recommended)
From this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## How seasons work

- Each log stores a date (`YYYY-MM-DD`) and maps to a season key (`YYYY-MM`).
- The app auto-creates the current month season at startup.
- Selecting **All-time** aggregates logs from all seasons.
- New month? The app creates that season automatically as soon as the app runs in that month.

## Points rules config

Edit the `POINTS` object in `app.js`:

```js
const POINTS = {
  base: { new: 100, used: 80, ev: 120 },
  highValueThreshold: 600_000,
  highValueBonus: 20,
  earlyBirdBonus: 10,
  tierSize: 1000,
};
```

This controls:
- Base points by sale type
- Bonus for high-value sales
- Early-bird bonus (logs before noon)
- Tier progression size
