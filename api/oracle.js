export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Проверка наличия ключа
  if (!apiKey) {
    return res.status(200).json({ answer: "Ошибка: GEMINI_API_KEY не настроен в Vercel." });
  }

  try {
    // В Node.js 18+ fetch доступен глобально, require не нужен
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — таинственный Оракул. Ответь мистически на русском на вопрос по картам Таро: ${question}` }] 
        }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды сегодня слишком туманны...";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ answer: "Ошибка связи с миром духов." });
  }
}
