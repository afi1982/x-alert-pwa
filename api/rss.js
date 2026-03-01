export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, langs = 'en,he,ar,fa', hours = '2' } = req.query;

  if (!q) return res.status(400).json({ error: 'Missing query parameter: q' });

  const langList = langs.split(',').filter(Boolean);
  const maxHours = Math.min(parseInt(hours) || 2, 24);

  const langConfig = {
    en: { hl: 'en', gl: 'US', ceid: 'US:en' },
    he: { hl: 'iw', gl: 'IL', ceid: 'IL:he' },
    ar: { hl: 'ar', gl: 'EG', ceid: 'EG:ar' },
    fa: { hl: 'fa', gl: 'IR', ceid: 'IR:fa' },
    ru: { hl: 'ru', gl: 'RU', ceid: 'RU:ru' },
    fr: { hl: 'fr', gl: 'FR', ceid: 'FR:fr' },
    tr: { hl: 'tr', gl: 'TR', ceid: 'TR:tr' }
  };

  // Build multiple search queries for broader coverage
  const queries = [
    q,                          // Original keyword
    `${q} when:${maxHours}h`,   // Time-filtered
  ];

  const fetches = [];
  for (const lang of langList) {
    const cfg = langConfig[lang] || langConfig.en;
    for (const query of queries) {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${cfg.hl}&gl=${cfg.gl}&ceid=${cfg.ceid}`;
      fetches.push(fetchRss(url, lang));
    }
  }

  try {
    const results = await Promise.allSettled(fetches);
    const allItems = [];
    const seenUrls = new Set();

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        for (const item of r.value) {
          // Dedup by URL
          const urlKey = normalizeUrl(item.link);
          if (!seenUrls.has(urlKey)) {
            seenUrls.add(urlKey);
            allItems.push(item);
          }
        }
      }
    }

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Filter to requested time window
    const cutoff = Date.now() - maxHours * 60 * 60 * 1000;
    const recent = allItems.filter(item => {
      const t = new Date(item.pubDate).getTime();
      return !isNaN(t) && t > cutoff;
    });

    return res.status(200).json({
      results: recent.slice(0, 80),
      total: recent.length,
      queriedAt: new Date().toISOString(),
      languages: langList,
      keyword: q
    });
  } catch (err) {
    console.error('RSS handler error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

async function fetchRss(url, lang) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });

    if (!response.ok) return [];

    const xml = await response.text();
    return parseRss(xml, lang);
  } catch (e) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function parseRss(xml, lang) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractCdata(block, 'title');
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const source = extractCdata(block, 'source');
    const description = extractCdata(block, 'description');

    if (title && link) {
      // Clean the Google News redirect URL
      const cleanLink = cleanGoogleUrl(link);

      items.push({
        title: cleanHtml(title),
        link: cleanLink,
        pubDate: pubDate || new Date().toISOString(),
        source: cleanHtml(source) || detectSource(cleanLink),
        description: cleanHtml(description).slice(0, 300),
        language: lang,
        origin: 'rss'
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  // Match both plain text and CDATA
  const regex = new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? (m[1] || m[2] || '').trim() : '';
}

function extractCdata(xml, tag) {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cm = xml.match(cdataRegex);
  if (cm) return cm[1].trim();

  // Fall back to plain text
  return extractTag(xml, tag);
}

function cleanHtml(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function cleanGoogleUrl(url) {
  // Google News uses redirect URLs, try to extract the actual URL
  if (url.includes('news.google.com/rss/articles/')) {
    return url; // Can't decode server-side, will redirect client-side
  }
  try {
    const u = new URL(url);
    const redirect = u.searchParams.get('url') || u.searchParams.get('q');
    if (redirect && redirect.startsWith('http')) return redirect;
  } catch (e) {}
  return url;
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname + u.pathname;
  } catch {
    return url;
  }
}

function detectSource(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    return parts.length > 1 ? parts[parts.length - 2] : hostname;
  } catch {
    return 'Unknown';
  }
}
