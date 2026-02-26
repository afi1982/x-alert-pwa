# Codebase Concerns

**Analysis Date:** 2026-02-27

## Security Risks

**Exposed API Key in Client Code:**
- Issue: Frontend code in `x-live-alert-pwa.html` (line 245) directly calls `https://api.anthropic.com/v1/messages` with an API key embedded or required client-side
- Files: `x-live-alert-pwa.html` (line 245-254), `index.html`
- Risk: API keys exposed in browser network requests, rate-limited quotas vulnerable to abuse, no server-side validation
- Current mitigation: None - keys must be sent from frontend
- Recommendations: Move all API calls to backend handler at `/api/search`, proxy Claude API calls through `api/search.js.py` instead of exposing direct endpoints

**CORS Allow-All Configuration:**
- Issue: `api/search.js.py` (line 3) sets `Access-Control-Allow-Origin: *` without authentication
- Files: `api/search.js.py` (line 3)
- Risk: Any website can make requests to your API endpoints, consuming quota and performing resource-intensive searches
- Current mitigation: None
- Recommendations: Restrict CORS to your domain, implement rate limiting at API layer, add request validation

**Missing Input Validation:**
- Issue: `api/search.js.py` accepts `req.body.prompt` directly without sanitization (line 28)
- Files: `api/search.js.py` (line 28)
- Risk: Prompt injection attacks possible; malicious users can craft prompts to manipulate API behavior or extract unintended information
- Current mitigation: None
- Recommendations: Validate and sanitize prompt content, use parameterized prompts, implement content length limits

**Service Worker Security:**
- Issue: `sw.js` (line 23) uses "network first" caching strategy without validation
- Files: `sw.js` (line 21-25)
- Risk: Stale or poisoned network responses could be cached indefinitely; attackers could serve malicious content through network interception
- Current mitigation: SW caching headers set in vercel.json but fallback is unchecked
- Recommendations: Implement cache validation, use service worker update checks, validate response integrity before caching

**No Authentication/Authorization:**
- Issue: All API endpoints accessible without any form of authentication
- Files: `api/search.js.py`, `vercel.json`
- Risk: Unauthenticated quota abuse, API costs uncontrolled, no user accountability
- Recommendations: Add API key validation, implement rate limiting per IP/key, consider user authentication

## Tech Debt

**Monolithic HTML File:**
- Issue: `x-live-alert-pwa.html` contains 479 lines of mixed HTML, CSS, and JavaScript inline
- Files: `x-live-alert-pwa.html`
- Impact: Hard to maintain, no code reuse, difficult to version control, poor testing capability
- Fix approach: Split into separate files (HTML structure, CSS styles, JS modules) or use a frontend framework

**Duplicate Files:**
- Issue: Both `index.html` (151 lines) and `x-live-alert-pwa.html` (479 lines) exist with overlapping functionality
- Files: `index.html`, `x-live-alert-pwa.html`
- Impact: Confusion about which file is canonical, maintenance burden, potential feature divergence
- Fix approach: Consolidate into single entry point or clearly document which is production vs. template

**Mixed API Backends:**
- Issue: Code calls both Gemini API (via `/api/search`) and raw Claude API directly
- Files: `x-live-alert-pwa.html` (lines 245, 282), `api/search.js.py`
- Impact: Unclear which backend is actually used, potential duplicate API calls, inconsistent error handling
- Fix approach: Consolidate to single API handler, remove direct Claude API calls from frontend

**Fragile JSON Parsing:**
- Issue: Multiple regex-based JSON extraction patterns with minimal error handling
- Files: `x-live-alert-pwa.html` (line 261: `text.match(/\{[\s\S]*\}/)`), `x-live-alert-pwa.html` (line 292: `t.match(/\{[\s\S]*\}/)`)
- Impact: If API returns malformed JSON or multiple JSON objects, parsing fails silently or extracts wrong object
- Fix approach: Use strict JSON parsing with schema validation, add detailed error logging

**Weak Session Management:**
- Issue: No session state persisted between browser sessions; all keywords/alerts lost on refresh
- Files: `x-live-alert-pwa.html` (global `S` object), `index.html` (same)
- Impact: Poor UX - users must re-add keywords after closing browser
- Fix approach: Implement localStorage persistence with JSON serialization

## Performance Bottlenecks

**Inefficient Duplicate Detection:**
- Issue: Uses `Set` for post deduplication with `hash()` function based on text normalization
- Files: `x-live-alert-pwa.html` (line 190: `hash()`, line 323-325)
- Problem: `hash()` does string slicing (`.slice(0, 120)`) which is lossy; two different posts might hash to same value; Set grows unbounded
- Cause: Set memory grows without limit (line 346 caps at 400 but using .slice() can lose old entries)
- Improvement path: Use proper hashing algorithm (SHA-256), implement size-limited LRU cache, test collision rates

**Memory Leak in Intervals:**
- Issue: `S.intervals` dictionary accumulates setInterval handles without guaranteed cleanup
- Files: `x-live-alert-pwa.html` (lines 354, 359, 141 old code)
- Cause: If keywords are added/removed rapidly, old intervals might not be cleared
- Impact: Memory leak over extended use, especially on mobile devices
- Improvement path: Implement WeakMap for interval tracking or guarantee cleanup in removeKW()

**Unbounded Alert List:**
- Issue: Alerts list could grow indefinitely (capped at 80 only during cycle, line 345)
- Files: `x-live-alert-pwa.html` (line 336: `S.alerts.unshift()`, line 345: cap)
- Impact: DOM rendering performance degrades with many alerts; memory usage grows
- Improvement path: Implement strict FIFO queue with fixed max size, add pagination for older alerts

**DOM Thrashing:**
- Issue: `render()` function rewrites entire app innerHTML on every state change
- Files: `x-live-alert-pwa.html` (line 383-473)
- Impact: All DOM nodes destroyed/recreated even for minor updates (e.g., status icons); event listeners re-attached
- Cause: No diffing algorithm, full re-render on every render() call
- Improvement path: Use virtual DOM or only update changed elements, batch renders

**Synchronous Sound Generation:**
- Issue: `playSound()` creates AudioContext synchronously (line 195-200)
- Files: `x-live-alert-pwa.html` (line 192-200)
- Impact: Could block main thread on slower devices, especially if called frequently
- Improvement path: Create AudioContext once and reuse, use preloaded audio files instead

## API Integration Gaps

**Fragile API Response Parsing:**
- Issue: Claude/Gemini API responses are parsed with regex fallback pattern
- Files: `x-live-alert-pwa.html` (lines 261-264, 292-295)
- Risk: If API response format changes or contains multiple JSON objects, extraction fails
- Recommendations: Add response schema validation, implement fallback modes with user-friendly errors

**No API Rate Limiting:**
- Issue: Frontend makes API calls every 60 seconds (line 354 default) with no backoff
- Files: `x-live-alert-pwa.html` (lines 354, 141 old code)
- Impact: Rapid quota consumption, no protection against cascading failures
- Recommendations: Implement exponential backoff, respect API headers (Retry-After), queue requests

**Timeout Not Implemented:**
- Issue: `fetch()` calls have no timeout mechanism
- Files: `x-live-alert-pwa.html` (lines 245, 282), `api/search.js.py` (line 23)
- Impact: Hung requests consume resources, no recovery mechanism
- Recommendations: Add AbortController with 10-30 second timeout, retry with backoff

**Missing Error Recovery:**
- Issue: API errors are stored in `S.errors` but no automatic recovery or notification to user
- Files: `x-live-alert-pwa.html` (lines 271-274, 315)
- Impact: User sees error message but app doesn't retry or suggest action
- Recommendations: Implement auto-retry with exponential backoff, notify user when service recovered

## Testing Gaps

**No Test Coverage:**
- What's not tested: All business logic - search, translation, deduplication, rendering
- Files: `x-live-alert-pwa.html`, `index.html`, `api/search.js.py`
- Risk: Regressions go undetected, API changes break functionality silently
- Priority: High
- Recommendations: Add unit tests for hash/uid functions, integration tests for search flow, E2E tests for notification

**No Type Safety:**
- Issue: JavaScript without types; data structures implicit
- Files: All `.html` files, `api/search.js.py`
- Risk: Runtime errors, incorrect assumptions about data shape
- Recommendations: Migrate to TypeScript or add JSDoc type annotations

## Scaling Limits

**Single-Threaded Frontend Processing:**
- Current capacity: Practical limit ~20-30 active keywords before UI becomes sluggish
- Limit: DOM rendering becomes bottleneck at ~50+ keywords
- Cause: Full re-render on every cycle, no virtual scrolling
- Scaling path: Implement virtual scrolling for alerts, use Web Workers for heavy computation, implement pagination

**Unbounded Search History:**
- Current capacity: `S.seen` Set grows until manually pruned (line 346 caps at 400)
- Limit: With 4+ keywords checking every 60s, set grows ~240/hour
- Scaling path: Implement time-based expiration (e.g., forget entries after 24 hours), use circular buffer

**API Rate Limits:**
- Current capacity: Dependent on Gemini/Claude API quotas (not documented)
- Limit: Unknown - could hit quota quickly with multiple users
- Scaling path: Implement quota tracking, queue requests intelligently, implement request deduplication

## Fragile Areas

**Hash Function Implementation:**
- Files: `x-live-alert-pwa.html` (line 190)
- Why fragile: Custom hash function with limited range (32-bit string hash), lossy text slicing
- Safe modification: Add test cases for collision rates, consider switching to crypto.subtle.digest
- Test coverage: None - no unit tests

**Search Response Parsing:**
- Files: `x-live-alert-pwa.html` (lines 260-264, 298-305)
- Why fragile: Multiple parsing strategies (JSON regex, fallback text extraction) with minimal validation
- Safe modification: Add response schema validation before parsing, test with edge cases
- Test coverage: Only manual testing; no schema validation

**Notification Delivery Pipeline:**
- Files: `x-live-alert-pwa.html` (lines 204-223), `sw.js` (lines 28-82)
- Why fragile: Relies on Service Worker availability, browser push notification API, user permissions
- Safe modification: Test fallback mechanisms, add user feedback for blocked notifications
- Test coverage: None - notification behavior untested

## Known Limitations

**No Real-Time Search:**
- Issue: App queries fixed-text API every 60 seconds; misses posts between checks
- Impact: "Live" alerts actually delayed by up to 60 seconds
- Workaround: Decrease interval to 30 seconds (but increases API costs)
- Fix: Implement WebSocket connection or polling with server-sent events

**Translation Quality Dependency:**
- Issue: App relies entirely on Claude/Gemini translation quality
- Impact: Machine translation errors not caught, misleading alerts possible
- Workaround: Display original text alongside translation
- Already implemented: `x-live-alert-pwa.html` (lines 458-459) shows original text in expandable details

**Keyword Matching Imprecise:**
- Issue: Post matching requires ALL keywords in text (line 332)
- Impact: AND logic only; can't search for phrases or Boolean operators
- Workaround: Users must carefully choose single keywords
- Fix: Implement OR/NOT logic, phrase matching, regex support

**No Mobile Offline Support:**
- Issue: While PWA caches assets, API calls still require network
- Impact: Historical alerts not available offline
- Fix: Cache alerts to localStorage, implement offline-first architecture

---

*Concerns audit: 2026-02-27*
