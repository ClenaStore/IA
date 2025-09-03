// pages/api/ask.js  — Next.js (Pages Router)

export default async function handler(req, res) {
  // 1) Ping para o botão "Testar conexão"
  if (req.method === "GET") {
    if (req.query.ping === "1") return res.status(200).send("ok");
    return res.status(405).json({ error: "Use POST em /api/ask" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });
    }

    const { model, messages } = req.body || {};

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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

    // SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // repassa as linhas SSE
      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) {
        if (line.startsWith("data:")) res.write(line + "\n\n");
      }
    }

    res.write('data: {"type":"done"}\n\n');
    res.end();
  } catch (err) {
    console.error("Erro API ask:", err);
    res.status(500).json({ error: err.message || "Erro interno" });
  }
}
