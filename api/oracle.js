export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = "Ты — мудрый и таинственный мастер Таро. Твоя задача — дать глубокое, мистическое и поэтичное предсказание на русском языке, основываясь на вопросе пользователя и выпавших картах. Используй абзацы для разделения текста.";

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
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды сегодня молчат...";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ answer: "Нить судьбы оборвалась. Проверь API ключ в настройках Vercel." });
  }
}
