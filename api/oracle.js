export default async function handler(req, res) {
  // Разрешаем только POST запросы от вашего фронтенда
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Проверка, что ключ дошел до сервера
  if (!apiKey) {
    return res.status(200).json({ answer: "Ошибка: Ключ GEMINI_API_KEY не найден в настройках Vercel." });
  }

  try {
    // Используем стабильную версию API v1
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — мудрый и таинственный мастер Таро. Твоя задача — дать глубокое, мистическое предсказание на русском языке, основываясь на вопросе пользователя и выпавших картах. Сделай ответ поэтичным. Вопрос: ${question}` }] 
        }]
      })
    });

    const data = await response.json();

    // Если Google вернул ошибку (например, 404 или 400), выводим её текст
    if (data.error) {
      return res.status(200).json({ 
        answer: `Ошибка API (${data.error.code}): ${data.error.message}` 
      });
    }

    // Извлекаем текст ответа
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (answerText) {
      return res.status(200).json({ answer: answerText });
    } else {
      return res.status(200).json({ answer: "Звезды сегодня слишком туманны, попробуйте еще раз." });
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ answer: "Нить судьбы оборвалась (ошибка сервера)." });
  }
}
