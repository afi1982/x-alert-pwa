# Requirements: X Live Alert PWA

**Defined:** 2026-02-27
**Core Value:** A journalist adds a keyword and gets a phone notification with Hebrew translation of every relevant post from the last 2 minutes on X — faster than any other tool.

## v1 Requirements

### Setup & Configuration

- [ ] **SETUP-01**: User is prompted for their Anthropic API key via first-run modal on initial app open
- [ ] **SETUP-02**: API key stored in memory only (not persisted to localStorage or source code)
- [ ] **SETUP-03**: Project files restructured into public/ directory per spec file structure
- [ ] **SETUP-04**: Backend proxy (api/search.js.py) removed; all API calls made client-side

### Keyword Management

- [ ] **KW-01**: User can add a keyword phrase (e.g. "פיצוץ איראן")
- [ ] **KW-02**: User can configure check interval per keyword (1min, 2min, 5min)
- [ ] **KW-03**: User can toggle individual keywords on/off
- [ ] **KW-04**: User can delete a keyword
- [ ] **KW-05**: Keywords displayed as chips with live status indicator (idle / searching / error)

### Search & Translation

- [ ] **SEARCH-01**: App uses Claude API (claude-sonnet-4-20250514) with web_search_20250305 tool
- [ ] **SEARCH-02**: Single API call performs both X/Twitter search AND Hebrew translation
- [ ] **SEARCH-03**: Only posts from the last 2 minutes are returned (posts older than 2 minutes discarded — non-negotiable)
- [ ] **SEARCH-04**: Posts deduplicated via content hash (no repeated alerts for same post)
- [ ] **SEARCH-05**: Search cycle completes in under 8 seconds
- [ ] **SEARCH-06**: Fallback text parsing if JSON extraction from response fails

### Alert Feed

- [ ] **ALERT-01**: Alert feed displays all detected posts in reverse-chronological order (newest first)
- [ ] **ALERT-02**: Each alert shows: keyword badge, author handle, Hebrew translated text, original post time, detection time
- [ ] **ALERT-03**: Expandable "מקור" section per alert shows original untranslated text
- [ ] **ALERT-04**: Keyword terms highlighted with <mark> tags in alert text
- [ ] **ALERT-05**: "New!" flash animation on alerts for 30 seconds after detection
- [ ] **ALERT-06**: Red border highlight on new alerts
- [ ] **ALERT-07**: Each alert has a link to the original post on X
- [ ] **ALERT-08**: "Clear all" button removes all alerts from feed
- [ ] **ALERT-09**: Maximum 80 alerts stored in memory at any time

### Notifications

- [ ] **NOTIF-01**: Browser notification permission requested on first visit
- [ ] **NOTIF-02**: New post triggers in-app popup notification (animated, auto-dismiss after 5 seconds)
- [ ] **NOTIF-03**: New post triggers Service Worker push notification (works when screen is off on Android)
- [ ] **NOTIF-04**: Phone vibration pattern [200, 100, 200, 100, 200] on new alert
- [ ] **NOTIF-05**: Alert sound via Web Audio API (sine wave pattern)
- [ ] **NOTIF-06**: Notification click opens the app
- [ ] **NOTIF-07**: Best-effort notification support across all platforms (Android + iOS + desktop browser)

### PWA & Offline

- [ ] **PWA-01**: App installable via "Add to Home Screen" banner on Android and iOS
- [ ] **PWA-02**: Standalone display mode (no browser chrome when installed)
- [ ] **PWA-03**: App shell cached for offline use via Service Worker
- [ ] **PWA-04**: App icons at 192x192 and 512x512 PNG

### UI & Animations

- [ ] **UI-01**: Dark theme (background #06060c, accent colors: red #ff2d4a, cyan #00e5ff, green #00e676)
- [ ] **UI-02**: Hebrew RTL layout with Noto Sans Hebrew for UI text, Space Mono for timestamps/metadata
- [ ] **UI-03**: Mobile-first layout, max-width 800px, touch-friendly, safe area insets
- [ ] **UI-04**: Loading bar sweep animation during active search cycle
- [ ] **UI-05**: Keyword chip scale-in animation on add
- [ ] **UI-06**: Alert card slide-down animation on new alert arrival
- [ ] **UI-07**: Status dot blink animation on active keyword
- [ ] **UI-08**: Sound toggle control in UI

## v2 Requirements

### Persistence

- **PERS-01**: Keywords and settings optionally persisted to localStorage (opt-in)

### Advanced Notifications

- **NOTIF-08**: User can configure notification sound on/off globally
- **NOTIF-09**: Per-keyword notification enable/disable

### Advanced Search

- **SEARCH-07**: User can set custom prompt overrides per keyword
- **SEARCH-08**: Multiple search sources beyond X/Twitter

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend API proxy | Removed — user provides own API key client-side |
| User accounts / auth | All state in-memory, no server |
| Persistent storage (default) | Volatile by design; localStorage opt-in deferred to v2 |
| Multi-language UI | Hebrew-only interface |
| Historical search | Real-time monitoring only |
| Social features (sharing, commenting) | Out of product scope |
| Native mobile app (iOS/Android) | PWA covers the use case |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SETUP-01 | Phase ? | Pending |
| SETUP-02 | Phase ? | Pending |
| SETUP-03 | Phase ? | Pending |
| SETUP-04 | Phase ? | Pending |
| KW-01 | Phase ? | Pending |
| KW-02 | Phase ? | Pending |
| KW-03 | Phase ? | Pending |
| KW-04 | Phase ? | Pending |
| KW-05 | Phase ? | Pending |
| SEARCH-01 | Phase ? | Pending |
| SEARCH-02 | Phase ? | Pending |
| SEARCH-03 | Phase ? | Pending |
| SEARCH-04 | Phase ? | Pending |
| SEARCH-05 | Phase ? | Pending |
| SEARCH-06 | Phase ? | Pending |
| ALERT-01 | Phase ? | Pending |
| ALERT-02 | Phase ? | Pending |
| ALERT-03 | Phase ? | Pending |
| ALERT-04 | Phase ? | Pending |
| ALERT-05 | Phase ? | Pending |
| ALERT-06 | Phase ? | Pending |
| ALERT-07 | Phase ? | Pending |
| ALERT-08 | Phase ? | Pending |
| ALERT-09 | Phase ? | Pending |
| NOTIF-01 | Phase ? | Pending |
| NOTIF-02 | Phase ? | Pending |
| NOTIF-03 | Phase ? | Pending |
| NOTIF-04 | Phase ? | Pending |
| NOTIF-05 | Phase ? | Pending |
| NOTIF-06 | Phase ? | Pending |
| NOTIF-07 | Phase ? | Pending |
| PWA-01 | Phase ? | Pending |
| PWA-02 | Phase ? | Pending |
| PWA-03 | Phase ? | Pending |
| PWA-04 | Phase ? | Pending |
| UI-01 | Phase ? | Pending |
| UI-02 | Phase ? | Pending |
| UI-03 | Phase ? | Pending |
| UI-04 | Phase ? | Pending |
| UI-05 | Phase ? | Pending |
| UI-06 | Phase ? | Pending |
| UI-07 | Phase ? | Pending |
| UI-08 | Phase ? | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 0
- Unmapped: 39 ⚠️

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 after initial definition*
