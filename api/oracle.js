export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ answer: "Ошибка: Ключ GEMINI_API_KEY не найден." });
  }

  try {
    // Используем gemini-1.5-pro — она самая мощная и обычно доступна по умолчанию
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — таинственный Оракул. Ответь глубоко и мистически на русском языке: ${question}` }] 
        }]
      })
    });

    const data = await response.json();

    // Если всё еще 404, значит Google хочет старую добрую версию gemini-pro
    if (data.error && data.error.code === 404) {
      const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Ответь как Оракул на русском: ${question}` }] }]
        })
      });
      const fallbackData = await fallbackResponse.json();
      const fallbackAnswer = fallbackData.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.status(200).json({ answer: fallbackAnswer || `Ошибка API: ${data.error.message}` });
    }

    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: answerText || "Звезды молчат..." });

  } catch (error) {
    return res.status(500).json({ answer: "Ошибка связи с миром духов." });
  }
}
