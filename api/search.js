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
          TASK: Find REAL-TIME news published in the LAST 60 SECONDS about "${keyword}".
          STRATEGY: Use Google Search with 'sort by date'. 
          CRITICAL: If the newest article is older than 2 minutes, return {"items": []}. Do not summarize old news.
          OUTPUT: Return ONLY a JSON array: {"items": [{"title": "Hebrew Title", "source": "Source", "url": "URL", "summary": "Short Hebrew Summary"}]}` 
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