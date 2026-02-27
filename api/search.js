export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { keyword } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Search Google for 3 real, recent news articles about "${keyword}". 
        Return ONLY a JSON array of objects with: title (Hebrew), source (English), url (valid link), summary (Hebrew). 
        Format: {"items": [...]}` }] }]
      })
    });

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(aiText));
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
}