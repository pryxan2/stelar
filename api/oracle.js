// Используем старый добрый формат, который Vercel понимает без лишних настроек
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Если ключ не дошел до кода, мы это сразу увидим на сайте
  if (!apiKey) {
    return res.status(200).json({ answer: "Ошибка: Ключ GEMINI_API_KEY не найден в настройках Vercel." });
  }

  const systemPrompt = "Ты — мудрый мастер Таро. Дай мистическое предсказание на русском языке по вопросу и картам.";

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${question}` }] }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды молчат...";
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ answer: "Ошибка связи с эфиром." });
  }
};
