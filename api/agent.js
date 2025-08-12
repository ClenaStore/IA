export default async function handler(req, res) {
  try {
    // Pegando a pergunta enviada pelo front (GET ou POST)
    const pergunta = req.method === 'POST' ? req.body.q : req.query.q;

    if (!pergunta) {
      return res.status(400).json({ erro: 'Nenhuma pergunta recebida.' });
    }

    // Fazendo chamada para API da OpenAI
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // Variável de ambiente
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Pode trocar para gpt-3.5-turbo se quiser economizar
        messages: [
          { role: "system", content: "Você é o assistente do Grupo DV, responda de forma objetiva." },
          { role: "user", content: pergunta }
        ],
        temperature: 0.7
      })
    });

    const data = await resposta.json();

    // Se houve erro da API
    if (data.error) {
      return res.status(500).json({ erro: data.error.message });
    }

    // Pegando texto da resposta
    const texto = data.choices?.[0]?.message?.content || "Sem resposta";

    res.status(200).json({
      sucesso: true,
      perguntaRecebida: pergunta,
      resposta: texto
    });

  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
}
