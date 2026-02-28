export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { keyword } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `
          CRITICAL MISSION: Search for the absolute latest news (last 60 seconds) about "${keyword}".
          SOURCES TO SCAN: 
          1. IRAN: IRNA, Fars News, Tasnim (Persian/English).
          2. LEBANON/HEZBOLLAH: Al-Manar, Al-Mayadeen.
          3. IRAQ: Sabereen News, Shafaq.
          4. GLOBAL: Reuters, Al-Jazeera.

          INSTRUCTIONS:
          - Find primary sources in Persian, Arabic, or English.
          - TRANSLATE everything immediately to HEBREW.
          - If no news from the last 2 minutes, return {"items": []}.
          - Return ONLY JSON: {"items": [{"title": "כותרת בעברית", "source": "שם המקור", "url": "URL", "summary": "תקציר בעברית"}]}` 
        }] }]
      })
    });

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(aiText));
  } catch (error) {
    res.status(200).json({ items: [] });
  }
}