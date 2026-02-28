export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { keyword } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // אנחנו משתמשים במודל שמחובר לחיפוש גוגל חי
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `
          MANDATORY: Search Google News for REAL articles from the last 24 hours about "${keyword}".
          LANGUAGES: Search in Persian, Arabic, and English.
          
          STRICT RULES:
          1. ONLY return articles with a VALID, VERIFIED URL.
          2. Do NOT invent news. If no real articles found from the last 24 hours, return {"items": []}.
          3. Translate title and summary to Hebrew.
          4. Output ONLY JSON: {"items": [{"title": "", "source": "", "url": "", "summary": ""}]}` 
        }] }],
        // הוספת רכיב ה-Search של גוגל למודל
        tools: [{ google_search_retrieval: {} }]
      })
    });

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(aiText));
  } catch (error) {
    res.status(200).json({ items: [] });
  }
}