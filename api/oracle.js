export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  const token = process.env.HF_TOKEN;

  // Промпт, который заставит нейросеть говорить как настоящий мастер Таро
  const systemPrompt = `Ты — потомственный медиум и мастер Таро. 
  Твоя речь полна тайн, мудрости и мистики. 
  Тебе прислали вопрос и три выпавшие карты. 
  Дай глубокое предсказание на русском языке. 
  Используй красивые метафоры. 
  Структура ответа: 
  1. Атмосферное вступление. 
  2. Толкование карт в контексте вопроса. 
  3. Финальный совет звезд. 
  Разделяй абзацы двойным переносом строки.`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] ${systemPrompt} \n\n ${question} [/INST]`,
          parameters: { 
            max_new_tokens: 800, 
            temperature: 0.8,
            top_p: 0.9
          }
        }),
      }
    );

    const result = await response.json();
    
    // Проверка на прогрев модели (Error 503)
    if (result.error && result.error.includes("loading")) {
      return res.status(503).json({ 
        answer: "Духи еще не явились на зов (модель загружается). Попробуй перевернуть карту через 20 секунд." 
      });
    }

    const fullText = result[0]?.generated_text || "";
    // Убираем техническую часть промпта из ответа
    const answer = fullText.split("[/INST]").pop().trim();

    return res.status(200).json({ 
      answer: answer || "Звезды сегодня скрыты густым туманом... Попробуй позже." 
    });

  } catch (error) {
    console.error("Oracle Error:", error);
    return res.status(500).json({ answer: "Нить судьбы оборвалась. Проверь связь с эфиром (токен)." });
  }
}
