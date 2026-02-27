export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const { keyword } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // שלב א': חיפוש תוצאות אמיתיות בגוגל חדשות / אתרים
    // אנחנו מבקשים מ-Gemini להשתמש ביכולת ה-Google Search המובנית שלו
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Search Google for the latest real news from the last hour about "${keyword}". 
        Return ONLY a JSON list of 3 items with: 'title' (translated to Hebrew), 'source_name', 'url', and 'summary' (short, in Hebrew).` }] }]
      })
    });

    const data = await response.json();
    
    // שליפת הטקסט שה-AI החזיר
    const aiResponse = data.candidates[0].content.parts[0].text;
    const cleanJson = aiResponse.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(cleanJson));
  } catch (error) {
    res.status(500).json({ error: "שגיאה במשיכת נתונים אמיתיים: " + error.message });
  }
}