# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Status:** No testing framework configured or present

**Runner:** Not detected
- No `jest.config.js`, `vitest.config.js`, or similar test configuration
- No test script in `package.json`
- Package.json contains only: `name`, `version`, `private` fields

**Assertion Library:** Not applicable

**Run Commands:**
```bash
# No test commands available
# Tests must be added to package.json scripts
```

## Test File Organization

**Location:** Not applicable - No test files exist

**Pattern:** Not established

**Existing structure:**
```
/c/Users/TempAdmin/Desktop/x-alert-pwa-main/
├── index.html                 # Main application
├── x-live-alert-pwa.html     # Alternative/variant version
├── sw.js                      # Service Worker (no tests)
├── api/
│   └── search.js.py           # API handler (no tests)
└── .planning/codebase/        # Documentation
```

**No test directories found:**
- No `__tests__/` directory
- No `tests/` directory
- No `.test.js` or `.spec.js` files
- No `test/` directory

## Test Structure

**Current State:** No tests exist in codebase

**Example patterns based on code analysis:**

If tests were to be added, they would need to cover these areas:

**Unit Test Pattern (Hypothetical):**
```javascript
// Testing utility functions like hash()
function hash(t) {
  let h = 0;
  const s = t.replace(/\s+/g, '').toLowerCase().slice(0, 120);
  for(let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h
  }
  return h.toString(36)
}

// Would need tests for:
// - Consistent hash for same input
// - Different hash for different inputs
// - Handling empty strings
// - Handling special characters
```

**Integration Test Areas (If tests existed):**
- Search keyword API integration with Claude API
- Translation API integration
- Service Worker message handling
- State management and renders
- Notification permission requests

## Mocking

**Framework:** Not applicable - No mocking library detected

**What would need mocking:**
- Fetch API calls to `https://api.anthropic.com/v1/messages`
- Service Worker API: `navigator.serviceWorker`
- Notification API: `Notification` object
- Audio Context API: `window.AudioContext`
- Web Storage (if implemented)

**Patterns in current code that suggest testing challenges:**
```javascript
// Tightly coupled API calls
const r = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ /* request */ })
});

// Global state mutations
S.keywords.push({...})
S.alerts.unshift({...})
S.seen.add(hash)

// Direct browser API usage
swReg = await navigator.serviceWorker.register('/sw.js');
notifPermission = await Notification.requestPermission();
```

## Fixtures and Factories

**Test Data:** Not applicable - No test infrastructure

**Hypothetical fixtures that would be needed:**
```javascript
// Mock keyword objects
const mockKeyword = {
  id: 'test-123',
  terms: 'iran explosion',
  interval: 60,
  active: true,
  status: 'idle',
  lastCheck: new Date().toISOString(),
  lastResult: '1 new post',
  totalChecks: 5
};

// Mock API response
const mockSearchResponse = {
  posts: [
    {
      text: 'Sample tweet about search term',
      author: '@user_handle',
      time: '2m ago',
      url: 'https://x.com/user/status/123'
    }
  ],
  translated: [
    {
      index: 1,
      hebrew: 'טוויט לדוגמה על מונח החיפוש',
      isRecent: true
    }
  ]
};

// Mock alert object
const mockAlert = {
  id: 'alert-456',
  keywordId: 'test-123',
  keyword: 'iran explosion',
  originalText: 'Original English text',
  text: 'טקסט בעברית',
  author: '@username',
  postTime: '1m ago',
  url: 'https://x.com/user/status/123',
  detectedAt: new Date().toISOString(),
  isNew: true
};
```

**Location:** Not established - Would need dedicated `fixtures/` or `test/fixtures/` directory

## Coverage

**Status:** No coverage tooling configured

**Requirements:** None enforced - not tracked

**View Coverage:** No coverage reports available

**Code that would benefit from testing:**
- `searchKeyword()` - Complex API integration, critical path
- `translatePosts()` - Fallback handling, parsing logic
- `extractFB()` - Regex-based text parsing
- `runCycle()` - Core monitoring loop, state mutations
- `hash()` - Deduplication logic
- `hl()` - Text highlighting/markup

## Test Types

**Unit Tests:** Not implemented

**Areas needing unit tests:**
- `uid()` - ID generation uniqueness
- `hash()` - Hash collision rates, consistency
- `ft()` - Time formatting for various locales
- `ago()` - Time delta calculations
- `hl()` - Text highlighting edge cases
- `il()` - Interval string formatting

**Integration Tests:** Not implemented

**Areas needing integration tests:**
- `searchKeyword()` with mocked API responses
- `translatePosts()` with fallback behaviors
- `runCycle()` with state mutations
- Service Worker message passing (`SHOW_NOTIFICATION`)
- Notification permission flow

**E2E Tests:** Not implemented

**Framework:** Not applicable - Would need Playwright, Cypress, or similar

**Scenarios that would benefit from E2E testing:**
- Add keyword → trigger search → display alerts → notifications sent
- Sound toggle → verify playSound() behavior
- Keyword removal → verify cleanup of intervals and alerts
- Install prompt flow → verify banner display and app installation
- Clear alerts → verify state reset

## Common Patterns

**Async Testing:** Not established - No async test patterns in use

**Would require:**
```javascript
// Example pattern for async testing (not in use)
async function testSearchKeyword() {
  const result = await searchKeyword({ terms: 'test', interval: 60 });
  assert(result.posts !== undefined);
  assert(result.translated !== undefined);
}
```

**Error Testing:** Not established - No error test patterns

**Current error handling relies on try-catch at runtime:**
```javascript
// Error caught at runtime, added to S.errors
try {
  const r = await fetch(...);
  if(!r.ok) throw new Error(`API ${r.status}`);
} catch(err) {
  S.errors.push({time: new Date().toISOString(), msg: err.message});
}
```

## Recommendations for Testing Implementation

**Priority 1 (Critical):**
1. Install test framework: `npm install --save-dev vitest` (lightweight, modern)
2. Test `searchKeyword()` and `translatePosts()` - Core API integration
3. Test `runCycle()` - State mutation and alert creation
4. Mock Anthropic API responses

**Priority 2 (Important):**
1. Service Worker tests via `@types/service_worker_api`
2. State management tests for `S` object mutations
3. Utility function tests (`hash`, `ft`, `ago`, `hl`)

**Priority 3 (Nice to have):**
1. E2E tests with Playwright
2. Coverage reporting (vitest has built-in coverage)
3. Integration tests with real API (with toggle)

**Testing strategy for current codebase:**
- Refactor API calls into separate modules for easier mocking
- Extract state management into testable functions
- Add `package.json` test script: `"test": "vitest"`
- Create `src/` directory structure for organized code
- Move inline script from HTML to separate files

---

*Testing analysis: 2026-02-27*
