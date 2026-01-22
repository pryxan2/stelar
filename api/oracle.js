export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 1. Спрашиваем список доступных моделей у самого Google
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    // 2. Ищем любую модель, которая поддерживает генерацию контента
    const availableModel = listData.models?.find(m => m.supportedGenerationMethods.includes('generateContent'));

    if (!availableModel) {
      return res.status(200).json({ 
        answer: "Google не предоставил доступ ни к одной модели. Проверьте статус ключа в AI Studio." 
      });
    }

    // 3. Используем найденную модель (её точное имя из системы)
    const modelName = availableModel.name; 
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Ты — Оракул. Ответь на русском: ${question}` }] }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Звезды молчат...";
    
    return res.status(200).json({ answer });

  } catch (error) {
    return res.status(500).json({ answer: "Ошибка входа в чертоги разума." });
  }
}
