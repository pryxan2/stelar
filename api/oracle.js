export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ answer: "Ошибка: Ключ GEMINI_API_KEY не найден в Vercel." });
  }

  try {
    // Используем v1beta и ПОЛНОЕ название модели с суффиксом -latest
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — мудрый Оракул. Дай мистический ответ на русском языке: ${question}` }] 
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Если опять будет 404, этот текст подскажет нам точное имя, которое хочет Google
      return res.status(200).json({ 
        answer: `Google API сообщает: ${data.error.message}` 
      });
    }

    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: answerText || "Звезды молчат..." });

  } catch (error) {
    return res.status(500).json({ answer: "Ошибка связи с сервером предсказаний." });
  }
}
