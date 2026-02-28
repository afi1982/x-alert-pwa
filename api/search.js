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
          STRICT SEARCH MISSION: Find REAL news from the LAST 60-120 SECONDS only.
          KEYWORD: "${keyword}"
          
          MANDATORY SEARCH STRATEGY:
          1. Translate "${keyword}" to Persian (Farsi), Arabic, and English.
          2. Search primary sources: IRNA, Tasnim, Sabereen News, Al-Manar, Al-Jazeera, Reuters, Twitter/X trends.
          3. Focus on "Breaking News" and "Last Minute" reports.

          OUTPUT FORMAT:
          - Translate all titles and summaries to HEBREW.
          - MANDATORY: The 'url' must be a valid, clickable, direct link to the article.
          - If no news from the last 2 minutes exists, return {"items": []}.
          
          Return ONLY valid JSON:
          {"items": [{"title": "כותרת בעברית", "source": "שם המקור", "url": "https://...", "summary": "תקציר בעברית"}]}` 
        }] }]
      })
    });

    const data = await response.json();
    let aiText = data.candidates[0].content.parts[0].text;
    
    // ניקוי טקסט מיותר שה-AI עלול להוסיף
    aiText = aiText.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(aiText));
  } catch (error) {
    console.error("Search Error:", error);
    res.status(200).json({ items: [] });
  }
}