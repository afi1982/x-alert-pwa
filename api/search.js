export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { keyword, customSources } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // הכנת רשימת מקורות להנחיה
  const sourcesList = customSources && customSources.length > 0 
    ? `סרוק במיוחד את: ${customSources.map(s => s.url).join(', ')}` 
    : "סרוק מקורות מובילים כמו Reuters, Al-Jazeera, IRNA, ו-Telegram";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `
          MISSION: Find recent intelligence/news about "${keyword}" from the LAST 24 HOURS.
          STRATEGY: 
          1. Translate "${keyword}" to Arabic, Persian, and English.
          2. ${sourcesList}.
          3. Find REAL and ACTIVE links only.
          
          OUTPUT RULES:
          - Translate all titles and summaries to HEBREW.
          - If no results found, return {"items": []}.
          - Return ONLY valid JSON format.

          JSON STRUCTURE:
          {"items": [{"title": "כותרת", "source": "מקור", "url": "קישור", "summary": "תקציר"}]}` 
        }] }],
        tools: [{ google_search_retrieval: {} }] // זה הרכיב שמוודא שהוא באמת מחפש באינטרנט
      })
    });

    const data = await response.json();
    
    // שליפת הטקסט וניקוי בטוח
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json|```/g, "").trim();
    
    // בדיקה אם הטקסט הוא JSON תקין לפני שליחה
    const parsedData = JSON.parse(aiText);
    res.status(200).json(parsedData);

  } catch (error) {
    console.error("Search Error:", error);
    // החזרת מבנה ריק תקין במקרה של שגיאה
    res.status(200).json({ items: [] });
  }
}