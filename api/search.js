<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>X-ALERT PREMIER | חמ"ל מודיעין 2026</title>
    <link href="https://fonts.googleapis.com/css2?family=Platypi:wght@800&family=Noto+Sans+Hebrew:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #020408;
            --accent: #00f2ff;
            --accent-red: #ff0055;
            --glass: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.1);
            --text-main: #e2e8f0;
        }

        body {
            background: var(--bg);
            color: var(--text-main);
            font-family: 'Noto Sans Hebrew', sans-serif;
            margin: 0;
            overflow-x: hidden;
            min-height: 100vh;
        }

        #bg-effect {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 242, 255, 0.08) 0%, transparent 50%);
            z-index: -1;
            pointer-events: none;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }

        header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 30px 0; border-bottom: 1px solid var(--border);
            margin-bottom: 30px;
        }

        .brand h1 { font-family: 'Platypi'; font-size: 28px; margin: 0; color: var(--accent); letter-spacing: -1px; }

        .nav-links { display: flex; gap: 20px; align-items: center; }

        .btn-manage {
            color: var(--accent); text-decoration: none; font-size: 14px;
            border: 1px solid var(--accent); padding: 8px 15px; border-radius: 8px;
            transition: 0.3s; font-weight: 700;
        }

        .btn-manage:hover { background: var(--accent); color: black; box-shadow: 0 0 15px var(--accent); }

        .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #00ff00; }
        .dot { width: 8px; height: 8px; background: #00ff00; border-radius: 50%; box-shadow: 0 0 10px #00ff00; animation: pulse 2s infinite; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .search-section {
            background: var(--glass); padding: 35px; border-radius: 24px;
            border: 1px solid var(--border); margin-bottom: 40px; backdrop-filter: blur(15px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }

        .input-group { display: flex; gap: 12px; }

        input {
            flex: 1; background: rgba(0,0,0,0.6); border: 1px solid var(--border);
            padding: 18px; border-radius: 12px; color: white; font-size: 17px; outline: none;
            transition: 0.3s;
        }

        input:focus { border-color: var(--accent); box-shadow: 0 0 15px rgba(0, 242, 255, 0.1); }

        .btn-scan {
            background: linear-gradient(135deg, var(--accent) 0%, #00bfff 100%);
            color: black; border: none; padding: 0 35px; border-radius: 12px;
            font-weight: 900; cursor: pointer; font-family: 'Platypi'; transition: 0.3s;
        }

        .btn-scan:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0, 242, 255, 0.4); }

        .chips { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
        .chip { background: rgba(255,255,255,0.06); padding: 6px 15px; border-radius: 20px; font-size: 13px; border: 1px solid var(--border); }
        .chip b { color: var(--accent-red); cursor: pointer; margin-right: 8px; }

        .feed-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 30px; }

        .card {
            background: var(--glass); border: 1px solid var(--border); padding: 30px;
            border-radius: 20px; position: relative; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; flex-direction: column; overflow: hidden;
            animation: cardIn 0.5s ease-out;
        }

        @keyframes cardIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        .card:hover { border-color: var(--accent); transform: translateY(-8px); background: rgba(255,255,255,0.06); }

        .card::before {
            content: ''; position: absolute; top: 0; right: 0; width: 5px; height: 100%;
            background: linear-gradient(to bottom, var(--accent), var(--accent-red));
        }

        .card-meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; font-weight: 700; }
        .source-name { color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; }
        .time-stamp { color: #64748b; }

        .card-title { font-size: 20px; font-weight: 900; margin: 0 0 15px 0; line-height: 1.4; color: white; }
        .card-summary { font-size: 15px; color: #94a3b8; line-height: 1.7; margin-bottom: 25px; flex: 1; }

        .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px; }
        .target-label { font-size: 11px; color: #475569; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 5px; }
        
        .view-link {
            color: var(--accent); text-decoration: none; font-weight: 700; font-size: 14px;
            display: flex; align-items: center; gap: 5px; transition: 0.2s;
        }
        .view-link:hover { color: white; transform: translateX(-5px); }

        footer { text-align: center; padding: 50px; color: #475569; font-size: 12px; border-top: 1px solid var(--border); margin-top: 50px; }
    </style>
</head>
<body>

<div id="bg-effect"></div>

<div class="container">
    <header>
        <div class="brand"><h1>X-ALERT <span style="font-weight:300">PREMIER</span></h1></div>
        <div class="nav-links">
            <div class="status-indicator"><div class="dot"></div> סריקה פעילה</div>
            <a href="sources.html" class="btn-manage">ניהול מקורות ⚙️</a>
        </div>
    </header>

    <section class="search-section">
        <div class="input-group">
            <input type="text" id="kwInput" placeholder="הזן יעד או נושא לניטור (איראן, חיל האוויר, שגרירות)...">
            <button class="btn-scan" onclick="addKeyword()">START SCAN</button>
        </div>
        <div id="keywordsList" class="chips"></div>
    </section>

    <main id="alertsContainer" class="feed-grid">
        </main>
</div>

<footer>
    &copy; 2026 PREMIER INTEL SYSTEMS | מערכת ניטור רב-לשונית מבוססת AI | סיווג: סודי ביותר
</footer>

<audio id="alertSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"></audio>

<script>
    let keywords = JSON.parse(localStorage.getItem('intel_v2026_kws') || '[]');
    let seen = new Set();

    // אפקט רקע דינמי
    document.addEventListener('mousemove', e => {
        document.body.style.setProperty('--x', (e.clientX / window.innerWidth) * 100 + '%');
        document.body.style.setProperty('--y', (e.clientY / window.innerHeight) * 100 + '%');
    });

    function addKeyword() {
        const val = document.getElementById('kwInput').value.trim();
        if (val && !keywords.includes(val)) {
            keywords.push(val);
            localStorage.setItem('intel_v2026_kws', JSON.stringify(keywords));
            renderKeywords();
            fetchData(val);
        }
        document.getElementById('kwInput').value = '';
    }

    function renderKeywords() {
        document.getElementById('keywordsList').innerHTML = keywords.map(k => `
            <span class="chip">${k} <b onclick="removeKeyword('${k}')">✕</b></span>
        `).join('');
    }

    function removeKeyword(kw) {
        keywords = keywords.filter(k => k !== kw);
        localStorage.setItem('intel_v2026_kws', JSON.stringify(keywords));
        renderKeywords();
    }

    async function fetchData(kw) {
        // שליפת המקורות האישיים מה-LocalStorage לצורך שליחה ל-AI
        const customSources = JSON.parse(localStorage.getItem('intel_sources') || '[]');
        
        try {
            const r = await fetch('/api/search', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    keyword: kw,
                    customSources: customSources 
                })
            });
            const data = await r.json();
            
            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    // בדיקת כפילויות ולינקים תקינים
                    if (!item.url || !item.url.includes('http') || seen.has(item.url)) return;
                    
                    seen.add(item.url);
                    document.getElementById('alertSound').play().catch(() => {});
                    renderAlert(kw, item);
                });
            }
        } catch (e) { console.error("Scan error for: " + kw); }
    }

    function renderAlert(kw, item) {
        const container = document.getElementById('alertsContainer');
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-meta">
                <span class="source-name">${item.source}</span>
                <span class="time-stamp">${new Date().toLocaleTimeString('he-IL')}</span>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-summary">${item.summary}</p>
            <div class="card-footer">
                <span class="target-label">יעד: ${kw}</span>
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="view-link">צפה בדיווח מלא ←</a>
            </div>
        `;
        
        container.prepend(card);
    }

    // הפעלה ראשונית
    renderKeywords();
    
    // לופ סריקה אוטומטי (כל 40 שניות)
    setInterval(() => {
        keywords.forEach(fetchData);
    }, 40000);

</script>
</body>
</html>