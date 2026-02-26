# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**Google Gemini API:**
- AI-powered X (Twitter) post search and natural language processing
  - SDK/Client: Fetch API (direct HTTP calls)
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
  - Model: `gemini-1.5-flash` (free, fast tier)
  - Auth: API key via `GEMINI_API_KEY` environment variable
  - Usage:
    - `searchKeyword()` function (`index.html` lines 63-87) - Searches for latest 3 X posts about a keyword
    - `translatePosts()` function (`index.html` lines 89-105) - Translates post content to Hebrew

**Google Fonts API:**
- Web font delivery
  - Fonts: `Space Mono` (monospace), `Noto Sans Hebrew` (Hebrew text rendering)
  - Integration: Direct stylesheet link in `index.html` line 13
  - URL: `https://fonts.googleapis.com/css2?family=...`

## Data Storage

**Databases:**
- None - Client-side only state management

**File Storage:**
- Local filesystem only (Vercel static assets directory)
  - Icon files: `/icon-192.png`, `/icon-512.png`
  - Service Worker script: `/sw.js`
  - Manifest: `/manifest.json`

**Caching:**
- Service Worker Cache API - Offline-first caching strategy
  - Cache name: `x-alert-v3`
  - Cached assets: `['/', '/index.html', '/icon-192.png', '/icon-512.png']`
  - Strategy: Network-first with cache fallback (`sw.js` lines 20-25)

**State Storage:**
- Browser LocalStorage (implied) - Keywords, alerts, settings persistence
- In-Memory State Object: Variable `S` in `index.html` holds:
  - `keywords`: Array of monitored keywords
  - `alerts`: Array of detected posts
  - `soundOn`: Boolean notification setting
  - `intervals`: Search polling intervals
  - `seen`: Set of seen post hashes (deduplication)
  - `errors`: Error log

## Authentication & Identity

**Auth Provider:**
- None (public application)
- Google Gemini API uses API key authentication (server-side only)
  - Server-side implementation in `/api/search.js.py` (line 17-18)
  - Client never exposed to API key

## Monitoring & Observability

**Error Tracking:**
- None detected (built-in console.error logging)

**Logs:**
- Browser console logging
  - Error logs: `console.error()` in API functions (`index.html` lines 84, 102, 144)
  - Stored in state: `S.errors` array

## CI/CD & Deployment

**Hosting:**
- Vercel (serverless platform)
  - Automatic deployments from git
  - Auto-generated preview URLs

**CI Pipeline:**
- Vercel auto-deployment (implicit)
- No build step required (vanilla JavaScript)

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Google Gemini API authentication key (required for `/api/search` endpoint)

**Secrets location:**
- Vercel Environment Variables dashboard
- `.env.local` (if running locally - not committed)

## Webhooks & Callbacks

**Incoming:**
- Push notification data handler via Service Worker (`sw.js` lines 28-48)
  - Receives notification payload in `e.data`
  - Shows notification with title, body, icon, badge, vibration, and actions

**Outgoing:**
- None detected

## Request/Response Flow

**Search Flow:**
1. User adds keyword via frontend form (`index.html` line 134-141)
2. Frontend calls `searchKeyword()` with keyword object
3. Frontend POSTs to `/api/search` with Gemini prompt
4. `/api/search.js.py` handler:
   - Validates `GEMINI_API_KEY` environment variable
   - POSTs to Google Gemini API endpoint with request prompt
   - Returns JSON response to frontend
5. Frontend parses response and calls `translatePosts()`
6. Translation request follows same flow to `/api/search` with translation prompt
7. Results merged and stored in `S.alerts`
8. UI renders new alerts

**Polling:**
- Keywords are searched every 60 seconds (line 141: `setInterval(() => runCycle(id), 60000)`)
- Each cycle maintains deduplication via `S.seen` Set

**Push Notification Flow:**
- Service Worker receives push events from browser/OS
- Shows notification with custom Hebrew labels
- User clicks notification → opens app or focuses window

---

*Integration audit: 2026-02-27*
