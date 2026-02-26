# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- JavaScript (ES6+) - Client-side logic and frontend
- HTML5 - Application structure and layout
- CSS3 - Styling

**Secondary:**
- Python - API handler (Vercel serverless)

## Runtime

**Environment:**
- Node.js (implied by Vercel serverless deployment)
- Browser APIs (modern Web APIs)

**Package Manager:**
- npm (minimal - see package.json)
- Lockfile: Not present

## Frameworks

**Core:**
- None (vanilla JavaScript SPA)
- Web APIs: Service Workers, Push Notifications, Web App Manifest

**Build/Dev:**
- Vercel - Deployment and serverless functions

## Key Dependencies

**Critical:**
- Google Gemini API (v1beta) - AI model for X (Twitter) post search and Hebrew translation
- Vercel Serverless Functions - Backend API hosting

**Infrastructure:**
- Service Worker API - Offline caching and push notifications
- Web Manifest API - Progressive Web App support
- Fetch API - HTTP requests
- LocalStorage - State persistence (if implemented)

## Configuration

**Environment:**
- `GEMINI_API_KEY` - Required environment variable for Google Gemini API authentication
  - Location: Vercel environment variables
  - Used by: `/api/search.js.py` endpoint

**Build:**
- `vercel.json` - Vercel deployment configuration with route handling and Service Worker cache control
- `manifest.json` - PWA metadata and app configuration
- `index.html` - Single entry point with embedded styling and JavaScript

## Platform Requirements

**Development:**
- Modern browser with Service Worker support (Chrome 40+, Firefox 44+, Safari 11.1+, Edge 17+)
- Node.js for local development (if needed)
- Code editor

**Production:**
- Vercel hosting platform
- Google Cloud Console account with Gemini API enabled
- HTTPS certificate (provided by Vercel)

## Deployment

**Platform:** Vercel (serverless)

**Configuration:**
- Routes configured in `vercel.json` for:
  - Service Worker caching with no-cache headers
  - Manifest file routing
  - Catch-all route to `index.html` for SPA routing

**Static Assets:**
- Icon files: `/icon-192.png`, `/icon-512.png`
- Manifest: `/manifest.json`
- Service Worker: `/sw.js`

---

*Stack analysis: 2026-02-27*
