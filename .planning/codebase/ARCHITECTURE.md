# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Client-centric PWA with lightweight backend API proxy

**Key Characteristics:**
- Single-page application (SPA) running entirely in-browser after initial load
- Serverless backend (Vercel) handling only external API integration
- Service Worker enabling offline-first caching and push notifications
- Real-time data fetching with periodic polling cycles
- Real-time translation and text processing

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `x-live-alert-pwa.html`, `index.html`
- Contains: HTML structure, inline CSS (design system with theme variables), inline JavaScript (event handlers, DOM manipulation)
- Depends on: Service Worker, Browser APIs (Notification, AudioContext)
- Used by: User (browser interface)

**Application Logic Layer:**
- Purpose: Manage state, orchestrate data flow, implement monitoring cycles
- Location: Inline in `x-live-alert-pwa.html` (lines 179-477, script tag)
- Contains: State management (S object), keyword monitoring, alert deduplication, UI rendering
- Depends on: Search Layer, Translation Layer, Service Worker
- Used by: Presentation Layer

**Search & Integration Layer:**
- Purpose: Query external APIs (Claude/Anthropic, Gemini), translate content, parse responses
- Location: Inline functions `searchKeyword()` (lines 228-276), `translatePosts()` (lines 278-296), `extractFB()` (lines 298-306)
- Contains: API calls to Claude Web Search, Gemini (legacy), response parsing, fallback logic
- Depends on: Backend proxy (`/api/search`), Anthropic API, external web search
- Used by: Application Logic Layer

**Backend Proxy Layer:**
- Purpose: Forward requests to external LLM APIs with authentication, handle CORS
- Location: `api/search.js.py` (Vercel serverless function)
- Contains: CORS headers, request validation, Gemini API integration
- Depends on: Environment variables (GEMINI_API_KEY), Gemini API
- Used by: Search & Integration Layer

**Service Worker Layer:**
- Purpose: Handle offline support, caching, push notifications, background tasks
- Location: `sw.js`
- Contains: Cache management (network-first strategy), notification display, client message handling
- Depends on: Browser Cache API, Notification API
- Used by: Application Logic Layer, push event sources

**Data Persistence Layer:**
- Purpose: Store user state (keywords, alerts, deduplication), configuration
- Location: In-memory JavaScript objects (S.keywords, S.alerts, S.seen, S.intervals, S.errors)
- Contains: Keyword list, alert feed (limited to 80), deduplication hash set (limited to 400), error log
- Depends on: Nothing (volatile, no persistence to storage)
- Used by: Application Logic Layer

## Data Flow

**Monitoring Cycle (runCycle):**

1. User adds keyword via input → `addKW()` stores keyword in S.keywords
2. `start()` initiates polling interval (60s, 120s, or 300s configurable)
3. `runCycle()` called on schedule or user trigger
4. Calls `searchKeyword()` → issues POST to `/api/search` with prompt
5. `/api/search` forwards to Anthropic Claude API with web_search tool
6. Claude performs web search on X (Twitter), returns JSON-formatted posts
7. `searchKeyword()` extracts posts from response, calls `translatePosts()`
8. `translatePosts()` issues second API call for Hebrew translation
9. Posts deduplicated using `hash()` function (lowercase, whitespace-normalized, first 120 chars)
10. New alerts inserted at S.alerts[0], UI re-renders
11. `showPopup()` triggers in-app popup AND Service Worker notification
12. Audio played, vibration triggered (via Service Worker)
13. Alert marked `isNew=true` for 30s flash animation, then `isNew=false`

**State Management:**

```javascript
S = {
  keywords: [{ id, terms, interval, active, status, lastCheck, lastResult, totalChecks }],
  alerts: [{ id, keywordId, keyword, originalText, text, author, postTime, url, detectedAt, isNew }],
  soundOn: boolean,
  intervals: { [id]: intervalHandle },
  seen: Set<hash>,
  errors: [{ time, msg }]
}
```

- Keywords persist in-memory (volatile) - lost on page refresh
- Alerts limited to 80 most recent
- Seen hashes limited to 400 most recent (circular buffer)
- Error log capped at 5 entries

## Key Abstractions

**Keyword Object:**
- Purpose: Represents a single search term being monitored
- Examples: `{ id: "abc123", terms: "פיצוץ איראן", interval: 60, active: true, status: "idle" }`
- Pattern: Immutable ID, mutable status/stats, start/stop control via `start(id)` and `stop(id)`

**Alert Object:**
- Purpose: Represents a single detected post matching a keyword
- Examples: Lines 335 in `x-live-alert-pwa.html`
- Pattern: Contains both original text (English) and translation (Hebrew), deduplication hash, detection timestamp, UI state (isNew)

**Hash Function:**
- Purpose: Deduplication using content hash to avoid duplicate alerts
- Pattern: Normalizes text (lowercase, strip whitespace, first 120 chars), returns numeric hash as string

**Interval Management:**
- Purpose: Map keyword IDs to setInterval handles for cleanup
- Pattern: `S.intervals[id]` stores handle, cleared on `stop(id)`

## Entry Points

**Main Application Entry Point:**
- Location: `x-live-alert-pwa.html` (served by Vercel as fallback route per vercel.json)
- Triggers: Browser navigation to `/`, Service Worker registration, beforeinstallprompt event
- Responsibilities:
  - Register Service Worker
  - Initialize UI with `render()`
  - Set up event listeners (beforeinstallprompt, notification permission)
  - Establish initial state (S object)

**API Entry Point:**
- Location: `api/search.js.py` handler function
- Triggers: POST requests from `searchKeyword()` with prompt body
- Responsibilities:
  - Validate Content-Type and HTTP method
  - Extract prompt from request body
  - Forward to Anthropic Claude API with web_search tool
  - Return JSON response to client

**Service Worker Entry Point:**
- Location: `sw.js` registered via navigator.serviceWorker.register('/sw.js')
- Triggers: Browser service worker lifecycle events (install, activate, fetch, push, message)
- Responsibilities:
  - Cache static assets on install
  - Serve cached assets on fetch
  - Display push notifications
  - Handle notification clicks and background message events

## Error Handling

**Strategy:** Graceful degradation with error logging

**Patterns:**

- API failures: Try/catch in `searchKeyword()` (line 244), fallback to `extractFB()` text parsing
- Translation failures: Try/catch in `translatePosts()` (line 281), fallback to original text
- Missing JSON: Regex match `/\{[\s\S]*\}/` (line 261) with fallback parsing
- Search error: Log to S.errors (line 272), cap at 5 entries, display in UI with timestamp
- Keyword duplicate: Silent return in `addKW()` if keyword already tracked (line 367)
- Empty results: Return empty posts array, status set to 'idle' with message "אין חדש"

## Cross-Cutting Concerns

**Logging:**
- Approach: Browser console only, via `console.error()` and `console.log()`
- Error logging to S.errors array for UI display (errors panel shows last error)
- No server-side logging configured

**Validation:**
- Input: `terms.trim()` check in `addKW()`, prevent empty keywords
- Input: Duplicate keyword check (case-insensitive)
- Input: Minimum text length check (10 chars) in post processing (line 322)
- API response: Typeof checking on data object, existence checks on arrays

**Authentication:**
- API key: GEMINI_API_KEY stored as Vercel environment variable
- Anthropic API: Uses header `Authorization: Bearer` implicitly via fetch in x-live-alert-pwa.html (lines 245-254 send raw body, suggest this needs API key)
- Note: Current implementation shows Anthropic API call but API key handling unclear - check if key is embedded client-side or proxied

**Internationalization (i18n):**
- Approach: Hebrew-only UI, RTL direction set via `dir="rtl"` in HTML
- Date formatting: Hebrew locale `'he-IL'` in `ft()` function (line 375)
- Relative time: Hebrew text in `ago()` function (line 376)
- Translation: Claude API called per-cycle to translate detected posts to Hebrew

---

*Architecture analysis: 2026-02-27*
