# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```
x-alert-pwa-main/
├── .planning/           # GSD planning documents (generated, not committed)
├── .git/                # Git metadata
├── api/                 # Vercel serverless functions
├── index.html           # PWA entry point (minimal, references main app)
├── x-live-alert-pwa.html  # Primary application - all UI & logic
├── sw.js                # Service Worker - caching & notifications
├── manifest.json        # PWA manifest for installation
├── vercel.json          # Vercel routing configuration
├── package.json         # Project metadata (minimal)
├── README.md            # Project documentation
└── [assets]             # icon-192.png, icon-512.png (referenced but not in repo)
```

## Directory Purposes

**`api/`:**
- Purpose: Vercel serverless backend functions
- Contains: JavaScript/Node.js API handlers
- Key files: `search.js.py`

**`.planning/codebase/`:**
- Purpose: Architecture and codebase documentation
- Generated: By GSD mapping process
- Committed: Yes (to git)

**`[project root]`:**
- Purpose: Static files served by Vercel, entry points
- Contains: HTML, manifest, service worker, configuration
- Key files: `x-live-alert-pwa.html` (main application), `sw.js`, `manifest.json`

## Key File Locations

**Entry Points:**

- `index.html`: Fallback entry point (minimal HTML, may redirect or be overridden by routing)
- `x-live-alert-pwa.html`: Primary application containing all UI, state management, and API integration logic (3,479 lines total, ~2,000 lines script)
- `api/search.js.py`: Vercel serverless handler for `/api/search` POST requests

**Configuration:**

- `vercel.json`: Routes configuration (lines 1-9)
  - Service Worker: `/sw.js` → `/sw.js` with no-cache headers
  - Manifest: `/manifest.json` → `/manifest.json`
  - All other routes → `/index.html` (SPA fallback)

- `manifest.json`: PWA manifest (lines 1-24)
  - App name, short name, start URL, theme colors
  - Icon definitions (192x192, 512x512)
  - Display mode: standalone

- `package.json`: Minimal metadata only (5 lines) - no dependencies

**Core Logic:**

- `x-live-alert-pwa.html` (script section, lines 126-477):
  - Service Worker registration: lines 137-146
  - Installation prompt handling: lines 150-177
  - State object initialization: lines 180-187
  - Utility functions: lines 189-221
  - Search and translation logic: lines 228-306
  - Monitoring cycles: lines 309-348
  - Keyword management: lines 350-376
  - Rendering engine: lines 383-476

- `sw.js`:
  - Cache management: lines 1-18
  - Network fetch strategy: lines 21-25
  - Push notification display: lines 28-48
  - Notification click handling: lines 51-67
  - Background message handling: lines 70-82

**Styling:**

- `x-live-alert-pwa.html` (style section, lines 14-122):
  - CSS custom properties (design tokens): lines 15-24
  - Layout utilities: lines 25-122
  - Component styles: header, buttons, cards, animations
  - RTL layout: `dir="rtl"` in HTML tag

## Naming Conventions

**Files:**

- Camel case with kebab for multi-word files: `x-live-alert-pwa.html`, `search.js.py`
- Service Worker: `sw.js` (convention)
- Manifest: `manifest.json` (standard)
- HTML files: `.html` extension
- API route files: JavaScript with `.py` suffix (unusual - likely Vercel historical artifact)

**Directories:**

- Lowercase, hyphen-separated: `api/`, `.planning/`
- Hidden directories: `.git/`, `.planning/`, `.claude/`

**Functions:**

- Camel case: `searchKeyword()`, `translatePosts()`, `runCycle()`, `addKW()`, `removeKW()`
- Short abbreviations common: `kw` (keyword), `tr` (translation), `i` (index), `p` (post)
- Single-letter for utility: `hash()`, `uid()`, `ft()` (format time), `ago()`, `hl()` (highlight), `il()` (interval label)

**Variables:**

- Camel case: `showInstallBanner`, `deferredInstallPrompt`, `notifPermission`
- Short state keys: `S` (state singleton), `swReg` (service worker registration)
- Array/Collection naming: Plural or descriptive: `S.keywords`, `S.alerts`, `S.intervals`, `S.seen`, `S.errors`

**CSS Classes:**

- Lowercase abbreviations with dots/hyphens: `.app`, `.header`, `.logo`, `.pill`, `.ac` (alert card), `.chip`, `.at` (alert title)
- Utility suffixes: `.on` (active state), `.fl` (flash/new), `.srch` (searching), `.em` (empty)
- Color/state classes: `.red`, `.green`, `.accent`, `.warn`

## Where to Add New Code

**New Feature (e.g., Filter Alerts):**
- Primary code: Add functions in `x-live-alert-pwa.html` script section after `runCycle()` definition (around line 348)
- State: Add properties to S object (line 180)
- UI: Modify `render()` function HTML template (line 388)
- Tests: None (project has no test infrastructure)

**New Component/Module (e.g., Settings Panel):**
- Implementation: Add functions and CSS class in `x-live-alert-pwa.html`
- Styling: Add CSS rules in `<style>` section (lines 14-122)
- Event handlers: Add onclick/event listeners inline in HTML template
- State: Extend S object if needed for persistence

**Utilities:**

- Shared helpers: Add as functions in script section alongside `uid()`, `hash()`, `playSound()` etc. (lines 189-221)
- Format helpers: Follow pattern of `ft()`, `ago()`, `hl()`, `il()` (lines 375-378)
- Shared CSS: Add to `:root` variables or utility classes

**Backend Additions:**

- New API endpoints: Create new file in `api/` folder (e.g., `api/translate.js.py`)
- Vercel routing: Add route rule to `vercel.json` (lines 4-8)
- Environment variables: Add to Vercel project settings

## Special Directories

**`.planning/`:**
- Purpose: GSD-generated codebase documentation
- Generated: By `/gsd:map-codebase` agent
- Committed: Yes
- Subdirectories: `.planning/codebase/` contains `ARCHITECTURE.md`, `STRUCTURE.md`, etc.

**`.git/`:**
- Purpose: Git repository metadata
- Generated: Automatically by git
- Committed: No (always ignored)

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: By `npm install`
- Committed: No (in .gitignore)
- Current status: Not present (no dependencies in package.json)

## Monorepo or Polyrepo Structure

**Structure:** Single-repo monolith

**Frontend:**
- HTML/CSS/JS all in single file: `x-live-alert-pwa.html`
- Assets referenced but not included: `icon-192.png`, `icon-512.png`

**Backend:**
- Single serverless function: `api/search.js.py`
- Vercel auto-detects and deploys

**No separation:** No separate `frontend/` or `backend/` directories

## File Size and Complexity Reference

**`x-live-alert-pwa.html`:** ~3,500 lines total
- ~1,800 lines HTML structure + styles
- ~1,700 lines JavaScript logic
- Largest single file in codebase

**`sw.js`:** ~83 lines - simple cache and notification handler

**`api/search.js.py`:** ~47 lines - minimal API proxy

---

*Structure analysis: 2026-02-27*
