export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  // Vercel возьмет этот ключ из настроек Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = "Ты — мудрый и таинственный мастер Таро. Твоя задача — дать глубокое, мистическое и поэтичное предсказание на русском языке, основываясь на вопросе пользователя и выпавших картах. Используй абзацы для разделения текста. Будь серьезным и вдохновляющим.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          role: "user", 
          parts: [{ text: `${systemPrompt}\n\nЗапрос пользователя: ${question}` }] 
        }]
      })
    });

    const data = await response.json();
    
    // Проверка структуры ответа от Google
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды сегодня хранят молчание...";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ answer: "Нить судьбы оборвалась. Проверь настройки API в Vercel." });
  }
}
