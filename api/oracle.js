export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ answer: "Ошибка: API ключ не настроен в Vercel." });

  try {
    // 1. Автоматический поиск доступной модели
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();
    
    // Ищем любую модель, которая поддерживает генерацию текста
    const model = listData.models?.find(m => m.supportedGenerationMethods.includes('generateContent')) || { name: 'models/gemini-pro' };

    // 2. Запрос предсказания
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Ты — великий мистический Оракул. Дай глубокое предсказание на русском языке. 
          Структура: 1. Атмосферное вступление. 2. Толкование карт. 3. Пророчество. 4. Краткий совет.
          Данные пользователя: ${question}` }] 
        }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды сегодня скрыты за облаками...";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ answer: "Нить судьбы оборвалась. Попробуйте еще раз." });
  }
}
