# Roadmap: X Live Alert PWA

## Overview

A brownfield refactor of a working single-file PWA. The existing app uses a Gemini backend proxy; this refactor moves to direct client-side Claude API calls, restructures files into a public/ directory, and rebuilds the UI to match the target design spec. Six phases: restructure the foundation, replace the search engine, wire keyword management, build the alert feed, implement notifications, then polish the UI and animations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Restructure into public/, remove backend proxy, implement API key modal
- [ ] **Phase 2: Search Engine** - Replace Gemini with Claude API, single call search+translate, 2-min filter
- [ ] **Phase 3: Keyword Management** - Keyword chip UI with add/toggle/delete/interval and status indicators
- [ ] **Phase 4: Alert Feed** - Full alert card display with expandable source, highlights, animations, clear
- [ ] **Phase 5: Notifications** - Browser permission, in-app popup, Service Worker push, vibration, sound
- [ ] **Phase 6: UI Polish** - Dark theme, RTL typography, mobile layout, loading bar and all animations

## Phase Details

### Phase 1: Foundation
**Goal**: The app loads from a clean public/ file structure with no backend dependency, and users can enter their Anthropic API key to enable the app
**Depends on**: Nothing (first phase)
**Requirements**: SETUP-01, SETUP-02, SETUP-03, SETUP-04, PWA-01, PWA-02, PWA-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. App files live under public/ and Vercel serves them correctly as a static site with no serverless functions
  2. On first open, user sees a modal prompting for their Anthropic API key; entering a valid key dismisses the modal
  3. API key is held only in memory — refreshing the page clears it and shows the modal again
  4. App is installable via "Add to Home Screen" on Android and iOS and launches in standalone mode
  5. Service Worker caches the app shell so the UI loads offline (no API key prompt is cached away)
**Plans**: TBD

Plans:
- [ ] 01-01: Restructure files into public/ and update vercel.json; remove api/search.js.py
- [ ] 01-02: Build first-run API key modal and in-memory key storage; verify PWA manifest and icons

### Phase 2: Search Engine
**Goal**: The app performs real-time X/Twitter keyword searches using Claude API directly from the browser, returning only posts from the last 2 minutes translated into Hebrew
**Depends on**: Phase 1
**Requirements**: SEARCH-01, SEARCH-02, SEARCH-03, SEARCH-04, SEARCH-05, SEARCH-06
**Success Criteria** (what must be TRUE):
  1. Searching a keyword triggers a single Claude API call (claude-sonnet-4-20250514 + web_search_20250305) from the browser with the user's key in the Authorization header
  2. Results contain only posts published within the last 2 minutes; anything older is silently discarded
  3. Each result includes a Hebrew translation produced in the same API call as the search
  4. Duplicate posts (same content hash) are never shown twice in a session
  5. The full search cycle completes in under 8 seconds
  6. When JSON extraction from the API response fails, a text-parsing fallback still recovers usable results
**Plans**: TBD

Plans:
- [ ] 02-01: Implement direct Claude API client (fetch with auth header, web_search tool config, prompt)
- [ ] 02-02: Implement 2-minute post filter, deduplication hash, fallback parser, and cycle timing

### Phase 3: Keyword Management
**Goal**: Users can fully manage the set of keywords being monitored — adding, toggling, deleting, and configuring intervals — with live status visible on each keyword chip
**Depends on**: Phase 2
**Requirements**: KW-01, KW-02, KW-03, KW-04, KW-05
**Success Criteria** (what must be TRUE):
  1. User can type a keyword phrase and add it; it appears immediately as a chip in the UI
  2. User can select a check interval (1 min, 2 min, or 5 min) per keyword before or after adding it
  3. Each keyword chip shows a live status dot: idle (gray), searching (cyan blink), or error (red)
  4. User can toggle a keyword chip off to pause monitoring and back on to resume
  5. User can delete a keyword; it disappears from the chip list and monitoring stops
**Plans**: TBD

Plans:
- [ ] 03-01: Implement keyword state model and chip rendering with add/toggle/delete controls
- [ ] 03-02: Wire interval selector per keyword and connect chip status to search cycle state

### Phase 4: Alert Feed
**Goal**: Every detected post appears in the alert feed as a structured card with full metadata, expandable original text, keyword highlighting, and visual cues for freshness
**Depends on**: Phase 3
**Requirements**: ALERT-01, ALERT-02, ALERT-03, ALERT-04, ALERT-05, ALERT-06, ALERT-07, ALERT-08, ALERT-09
**Success Criteria** (what must be TRUE):
  1. New alerts appear at the top of the feed in reverse-chronological order, each showing keyword badge, author handle, Hebrew text, post time, and detection time
  2. Tapping the expandable "מקור" section on an alert reveals the original untranslated post text
  3. The keyword search terms are highlighted with <mark> tags inside the alert's Hebrew text
  4. Alerts detected in the last 30 seconds display a "New!" flash badge and a red border
  5. Each alert card contains a working link that opens the original post on X
  6. The "Clear all" button removes all alerts from the feed instantly
  7. The feed never holds more than 80 alerts; oldest are silently dropped when the cap is reached
**Plans**: TBD

Plans:
- [ ] 04-01: Build alert card component with all metadata fields, expandable source, and keyword highlights
- [ ] 04-02: Implement feed rendering (reverse-chron, 80-alert cap, clear-all, new-alert state flags)

### Phase 5: Notifications
**Goal**: Every new alert triggers a full notification stack — in-app popup, Service Worker push notification (including with screen off on Android), audio, and vibration
**Depends on**: Phase 4
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05, NOTIF-06, NOTIF-07
**Success Criteria** (what must be TRUE):
  1. On first visit, the app requests browser notification permission; the user can grant or deny it
  2. When a new alert arrives, an in-app popup appears and auto-dismisses after 5 seconds
  3. When a new alert arrives while the screen is off on Android, a system push notification appears via Service Worker
  4. Tapping a notification (in-app or system) opens or focuses the app
  5. Each new alert triggers phone vibration in the pattern [200, 100, 200, 100, 200] and a Web Audio API sound
  6. Notifications degrade gracefully — the app still works on platforms where some notification types are unavailable
**Plans**: TBD

Plans:
- [ ] 05-01: Implement in-app popup (animated, 5s auto-dismiss) and notification permission request flow
- [ ] 05-02: Wire Service Worker push notification, vibration pattern, Web Audio sound, and notification click handler

### Phase 6: UI Polish
**Goal**: The app matches the target design spec — dark theme, Hebrew RTL typography, mobile-first layout, and all micro-animations are present and correct
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. The entire app uses the dark theme (#06060c background, red #ff2d4a / cyan #00e5ff / green #00e676 accents) with no light-mode bleed
  2. UI text renders in Noto Sans Hebrew (RTL), timestamps and metadata render in Space Mono
  3. The layout is touch-friendly and centered at max-width 800px with safe area insets honored on notched phones
  4. A loading bar sweeps across the screen during an active search cycle and disappears when the cycle ends
  5. New keyword chips animate in with a scale-in effect; new alert cards slide down from the top; the active keyword status dot blinks
  6. A sound on/off toggle is visible in the UI and immediately affects whether audio plays on new alerts
**Plans**: TBD

Plans:
- [ ] 06-01: Apply dark theme CSS variables, RTL typography (Noto Sans Hebrew + Space Mono), and mobile layout
- [ ] 06-02: Implement loading bar, chip scale-in, alert slide-down, status dot blink animations, and sound toggle

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Search Engine | 0/2 | Not started | - |
| 3. Keyword Management | 0/2 | Not started | - |
| 4. Alert Feed | 0/2 | Not started | - |
| 5. Notifications | 0/2 | Not started | - |
| 6. UI Polish | 0/2 | Not started | - |
