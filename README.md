# Viral24

Viral24 is a mobile-first MVP that surfaces the most viral videos from the last 24 hours across YouTube, TikTok, and X, with a plug-in adapter architecture for adding new sources like Instagram Reels.

## Stack
- Next.js 14 + TypeScript
- TailwindCSS
- framer-motion
- Vitest (unit tests)

## Features
- TikTok-style vertical feed with swipe, keyboard nav, and double-tap like.
- Unified normalized schema:
  ```ts
  { id, platform, url, embedUrl, author, caption, hashtags, createdAt, views, likes, shares, comments, score, thumbnailUrl }
  ```
- Viral scoring:
  - `score = weighted_engagement_rate * recency_boost`
  - weighted engagement combines likes/comments/shares over views.
- Source adapter pattern:
  - `adapters/youtube.ts`
  - `adapters/tiktok.ts`
  - `adapters/x.ts`
- API route `/api/feed` with in-memory caching (TTL 10 minutes).
- Safe fallback behavior (no login scraping / ToS bypassing):
  - YouTube live mode through official Data API v3.
  - TikTok + X mock/curated fallback in MVP.
- Settings and persistence:
  - Autoplay, data saver, NSFW keyword filter, visible platforms.
  - Local like/save state persisted in localStorage.

## Mock mode (default)
The app is runnable out-of-the-box using fixtures.

## Environment variables
Create `.env.local`:

```bash
MOCK_MODE=true
YOUTUBE_API_KEY=
```

To enable live YouTube fetching:

```bash
MOCK_MODE=false
YOUTUBE_API_KEY=your_key_here
```

## Run locally
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`.

## Tests
```bash
npm test
```

## Deploy (Vercel)
1. Push this repository to GitHub.
2. Import project into Vercel.
3. Add env vars (`MOCK_MODE`, `YOUTUBE_API_KEY`) in project settings.
4. Deploy.

## Notes on platform constraints
- This MVP uses official/public-safe access only.
- It avoids scraping behind logins and avoids bypassing rate limits or ToS.
- TikTok and X use mock fallback in the base MVP.
