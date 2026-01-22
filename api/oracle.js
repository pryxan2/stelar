export default async function handler(req, res) {
  // Разрешаем запросы только методом POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  
  // Твой скрытый токен, который мы пропишем в настройках Vercel
  const token = process.env.HF_TOKEN;

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
          inputs: `Ты — таинственный античный оракул. Ответь на вопрос кратко, мистически и на русском языке. Вопрос: ${question}`,
          parameters: { max_new_tokens: 150, temperature: 0.7 }
        }),
      }
    );

    const result = await response.json();
    
    // Вырезаем только текст ответа
    let answer = result[0]?.generated_text || "Звезды молчат...";
    answer = answer.split("Вопрос:")[0].replace(/.*Ответ:/, "").trim();

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Ошибка связи с космосом" });
  }
}
