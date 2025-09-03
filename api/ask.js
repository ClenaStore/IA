// pages/api/ask.js  (Next.js App Router antigo)
// ou em app/api/ask/route.js se estiver usando App Router novo

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { model, messages, tools, url } = req.body;

    // Carrega chave da OpenAI da Vercel
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });
    }

    // Conexão com API da OpenAI (streaming)
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "gpt-5",
        messages: messages || [],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).send(err);
    }

    // Prepara streaming SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      // repassa cada linha SSE da OpenAI para o cliente
      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) {
        if (line.startsWith("data:")) {
          res.write(line + "\n\n");
        }
      }
    }

    res.write("data: {\"type\":\"done\"}\n\n");
    res.end();
  } catch (err) {
    console.error("Erro API ask:", err);
    res.status(500).json({ error: err.message || "Erro interno" });
  }
}
