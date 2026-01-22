const fetch = require('node-fetch'); // Для стабильности в старых окружениях

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Проверка ключа прямо в ответе для диагностики
  if (!apiKey) {
    return res.status(200).json({ answer: "Системная ошибка: Переменная GEMINI_API_KEY не найдена в Vercel." });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — таинственный Оракул. Ответь мистически на русском: ${question}` }] 
        }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды сегодня слишком туманны...";

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ answer: "Эфир перегружен. Попробуйте позже." });
  }
};
