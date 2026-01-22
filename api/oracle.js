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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — мудрый мастер Таро. Дай глубокое, мистическое предсказание на русском языке по вопросу и выпавшим картам. Вопрос: ${question}` }] 
        }]
      })
    });

    const data = await response.json();
    
    // Улучшенный разбор ответа (проверяем все уровни вложенности)
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (answerText) {
      return res.status(200).json({ answer: answerText });
    } else {
      // Если текста нет, выводим ошибку из ответа для диагностики
      console.error("Gemini Empty Response:", data);
      return res.status(200).json({ answer: "Духи молчат. Возможно, вопрос слишком туманен или API ключ не активен." });
    }

  } catch (error) {
    return res.status(500).json({ answer: "Связь с небесным чертогом прервана. Попробуйте снова." });
  }
}
