# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- HTML files: `kebab-case.html` (e.g., `x-live-alert-pwa.html`, `index.html`)
- JavaScript files: `kebab-case.js` (e.g., `sw.js`)
- Python/API files: `snake_case.py` (e.g., `search.js.py`)
- CSS: Inline within HTML `<style>` blocks
- JSON configs: Standard JSON format (e.g., `manifest.json`, `vercel.json`)

**Variables:**
- Camel case: `soundOn`, `deferredInstallPrompt`, `swReg`, `notifPermission`, `showInstallBanner`
- State object: Single-letter uppercase abbreviation `S` (e.g., `S.keywords`, `S.alerts`, `S.seen`)
- Boolean prefixes: `is`, `show` (e.g., `showInstallBanner`, `isRecent`)

**Functions:**
- Camel case: `registerSW()`, `requestNotifPermission()`, `installApp()`, `playSound()`, `searchKeyword()`, `translatePosts()`, `runCycle()`, `addKW()`, `removeKW()`, `clearAlerts()`
- Descriptive naming based on action performed
- Single responsibility: Each function has clear purpose

**Types/Objects:**
- State object: `S` - Central application state
- Keyword objects: `{ id, terms, interval, active, status, lastCheck, lastResult, totalChecks }`
- Alert objects: `{ id, keywordId, keyword, originalText, text, author, postTime, url, detectedAt, isNew }`
- Response objects: `{ posts, translated, error }`

**CSS Classes:**
- Short abbreviations with semantic meaning:
  - `.bs` - button small
  - `.bgo` - button go (primary action)
  - `.fi` - field input
  - `.fs` - field select
  - `.fr` - field row/flex container
  - `.ac` - alert card
  - `.at` - alert title
  - `.ab` - alert badge
  - `.atx` - alert text
  - `.aau` - alert author/user
  - `.chip` - keyword chip
  - `.pill` - status pill
  - `.dot` - status indicator dot
  - `.lb` - loading bar
  - `.lf` - loading fill animation
  - `.eb` - error box
  - `.fh` - feed header
  - `.fc` - feed count

## Code Style

**Formatting:**
- No automatic formatter configured (no ESLint, Prettier, or Biome detected)
- Indentation: 2 spaces (observed in HTML and JavaScript)
- Line continuations: Functions chained without line breaks where practical
- Semicolons: Used consistently for statement termination
- String quotes: Mixed single and double quotes based on context; double quotes used for HTML attributes

**Linting:**
- No formal linting rules detected
- Style enforced through code review and manual consistency
- Code follows implicit conventions rather than written rules

**Spacing:**
- No spaces around function parameters in inline handlers (e.g., `onclick="addKW(i.value,s.value)"`)
- Spaces around operators in logic (e.g., `k.status === 'searching'`)
- Compact CSS with minimal whitespace (e.g., `.logo-icon{width:40px;height:40px;...}`)

## Import Organization

**JavaScript/HTML:**
- No module imports; single monolithic script within `<script>` tags
- Functions and state declared sequentially in logical order:
  1. Service Worker registration
  2. Install/notification permission handlers
  3. Application state (`S` object)
  4. Utility functions (`uid()`, `hash()`, `playSound()`)
  5. API functions (`searchKeyword()`, `translatePosts()`)
  6. Core business logic (`runCycle()`, `start()`, `stop()`, `addKW()`)
  7. Helper functions (`ft()`, `ago()`, `hl()`)
  8. Rendering function (`render()`)

**API/Backend:**
- Environment variables accessed via `process.env.GEMINI_API_KEY`
- No path aliases or module resolution configuration detected

## Error Handling

**Patterns:**
- Try-catch blocks used for async operations:
  ```javascript
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {...});
    if(!r.ok) throw new Error(`API ${r.status}`);
    const data = await r.json();
    // ... process data
  } catch(err){
    console.error('Search error:', err);
    S.errors.push({time: new Date().toISOString(), msg: err.message});
    return {posts: [], translated: [], error: err.message};
  }
  ```

- Graceful degradation: Fallback behaviors when parsing fails:
  ```javascript
  const jm = text.match(/\{[\s\S]*\}/);
  let posts = [];
  if(jm) { try { posts = JSON.parse(jm[0]).posts || [] } catch(e) { posts = extractFB(text, kw.terms) } }
  else posts = extractFB(text, kw.terms);
  ```

- Silent failure patterns for non-critical operations:
  ```javascript
  function playSound(){
    if(!S.soundOn) return;
    try { /* audio context setup */ } catch(e) {}
  }
  ```

- Status field used for operation state tracking:
  - `kw.status = 'searching'` - operation in progress
  - `kw.status = 'found'` - results available
  - `kw.status = 'error'` - operation failed
  - `kw.status = 'idle'` - ready

## Logging

**Framework:** Browser `console` object

**Patterns:**
- Minimal logging to console:
  - `console.log('SW registered')` - Service Worker lifecycle
  - `console.log('SW registration failed:', e)` - Registration errors
  - `console.error('Search error:', err)` - API/search failures
  - `console.error('Translate err:', e)` - Translation failures
  - No info/debug logging; only error and critical operations

**Error Collection:**
- Application errors collected in state: `S.errors` array
- Limited to last 5 errors: `if(S.errors.length>5) S.errors.shift()`
- Displayed in UI with timestamp: `.eb` (error box) class
- Timestamp format: ISO 8601 via `new Date().toISOString()`

## Comments

**When to Comment:**
- Section markers: Major functional blocks marked with header comments
  ```javascript
  // ============================================
  // SEARCH via Claude API + Web Search
  // ============================================
  ```

- Brief inline comments for non-obvious logic:
  ```javascript
  // Send notification via Service Worker (works even in background!)
  ```

- Only comments provided in Hebrew for Hebrew UI strings are minimal

**JSDoc/TSDoc:**
- Not used in this codebase
- No formal documentation annotations observed

## Function Design

**Size:**
- Range: 5-60 lines per function
- Average: 20-30 lines
- Utility functions kept minimal (5-10 lines): `uid()`, `hash()`, `ft()`, `ago()`, `hl()`, `il()`
- Complex operations (30-60 lines): `searchKeyword()`, `runCycle()`, `render()`

**Parameters:**
- Functions accept 1-3 parameters
- `searchKeyword(kw)` - single object parameter
- `hl(text, terms)` - multiple simple parameters
- No destructuring used; full object references

**Return Values:**
- Mostly void functions that modify state and call `render()`
- API functions return objects: `{ posts, translated, error }`
- Utility functions return simple types: strings, numbers, booleans

## Module Design

**Exports:**
- No module exports; all functions in global scope
- Service Worker: Separate file with event listeners, no exports
- API handler: Single `export default async function handler(req, res)`

**Barrel Files:**
- Not applicable; no modular structure detected

## State Management

**Pattern:**
- Single global state object: `const S = { keywords: [], alerts: [], soundOn: true, intervals: {}, seen: new Set(), errors: [] }`
- Direct mutation: `S.keywords.push(...)`, `S.alerts.unshift(...)`, `S.seen.add(...)`
- No immutability pattern
- Change triggers: All state mutations followed by `render()` call to update UI

**Render Function:**
- Core of entire application: ~360 lines
- Called after every state change
- Uses template literals for HTML generation
- Inline event handlers: `onclick="installApp()"`, `onclick="S.soundOn=!S.soundOn;render()"`

---

*Convention analysis: 2026-02-27*
