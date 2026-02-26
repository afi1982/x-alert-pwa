# X Live Alert PWA

## What This Is

A Hebrew-language Progressive Web App for real-time monitoring of X (Twitter) by keyword. The app searches for posts matching user-defined keywords, filters to only posts from the last 2 minutes, auto-translates to Hebrew, and pushes notifications to the user's phone. Designed for Israeli journalists, intelligence professionals, and anyone who needs to be first to know about breaking news.

## Core Value

A journalist adds a keyword and within seconds gets a phone notification with Hebrew translation of every relevant post from the last 2 minutes on X — faster than any other tool.

## Requirements

### Validated

<!-- Inferred from existing codebase — these capabilities already exist in some form -->

- ✓ Keyword management (add, toggle, delete, configurable polling interval) — existing
- ✓ Polling-based search cycle with interval management — existing
- ✓ Alert deduplication via content hashing — existing
- ✓ Alert feed (newest-first, max 80 alerts, 400 seen hashes) — existing
- ✓ In-app popup notification on new alert — existing
- ✓ Alert sound via Web Audio API — existing
- ✓ Service Worker registered (offline caching, basic push support) — existing
- ✓ PWA manifest (installable, standalone mode) — existing
- ✓ Hebrew RTL UI — existing
- ✓ Vercel deployment with correct Service Worker headers — existing

### Active

- [ ] Restructure files into public/ directory (per spec file structure)
- [ ] Replace Gemini API with Claude API (claude-sonnet-4-20250514 + web_search_20250305)
- [ ] User-provided API key — entered in UI, stored in memory (no server-side key)
- [ ] Remove backend proxy — direct client-side calls to Anthropic API
- [ ] Single API call for both search AND Hebrew translation
- [ ] Strict 2-minute post filter — posts older than 2 minutes discarded (non-negotiable)
- [ ] Push notifications with vibration pattern [200,100,200,100,200] and auto-dismiss after 5s
- [ ] Notifications work when screen is off (Android Service Worker push)
- [ ] Keyword terms highlighted with <mark> tags in alert cards
- [ ] "New!" flash animation on fresh alerts (30s), red border highlight
- [ ] Dark theme UI (#06060c bg, red/cyan/green accent palette)
- [ ] Mobile-first layout, max-width 800px, safe area insets
- [ ] "Add to Home Screen" install banner
- [ ] Alert card expandable "מקור" (original text) section
- [ ] Loading bar sweep animation during search
- [ ] Chip scale-in, alert slide-down, status dot blink animations
- [ ] Clear all alerts button

### Out of Scope

- Backend API proxy — user provides their own API key in UI
- User accounts or persistent storage (all state in-memory)
- Multi-language UI — Hebrew only
- Social features, sharing, comments
- Historical search (only monitors in real-time)
- Multiple simultaneous active keywords without user-set intervals

## Context

Existing codebase is a working single-file PWA (`x-live-alert-pwa.html` / `index.html`) with inline JS, CSS, and service worker. The architecture uses a Vercel serverless function (`api/search.js.py`) as a proxy to Gemini API. The refactor will:
1. Move all files into a `public/` directory
2. Remove the Gemini backend proxy entirely
3. Call Anthropic Claude API directly from the browser using a user-provided API key
4. Rebuild the UI to match the spec's design system and animation requirements

The existing service worker, PWA manifest, and deduplication logic are worth preserving and refining rather than rewriting from zero.

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only — no frameworks, no bundlers, no npm build step
- **API**: Claude API (claude-sonnet-4-20250514) with web_search_20250305 tool
- **Performance**: Search cycle < 8 seconds; max 80 alerts, 400 hashes in memory
- **Security**: No API keys in source code — user enters their own key, held in memory only
- **Deployment**: Vercel static hosting (no serverless functions needed post-refactor)
- **UI language**: Hebrew RTL interface only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| User-provided API key (client-side) | No server needed; each user uses own Anthropic account | — Pending |
| Single Claude call for search + translate | Faster cycle (<8s), simpler code, avoids double-billing | — Pending |
| Refactor existing, don't full-rewrite | Preserve working deduplication, Service Worker, manifest | — Pending |
| Restructure to public/ folder | Aligns with Vercel static site conventions, cleaner separation | — Pending |
| Remove Gemini/backend proxy | Simplifies architecture, aligns with spec | — Pending |

---
*Last updated: 2026-02-27 after initialization*
