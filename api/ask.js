// pages/api/ask.js  (Next.js Pages Router)

export const config = { api: { bodyParser: false } }; // permite multipart

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (req.query.ping === "1") return res.status(200).send("ok");
    res.setHeader("Allow", ["GET","POST"]);
    return res.status(405).json({ error: "Use POST em /api/ask" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET","POST"]);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY não configurada" });

    // Lê JSON ou multipart (campo 'payload' + files)
    const ctype = (req.headers["content-type"] || "").toLowerCase();
    let payload = {};
    if (ctype.includes("multipart/form-data")) {
      const form = await new Promise((resolve, reject) => {
        // usa Web API disponível em Vercel (edge compat) se req.formData existir
        if (typeof req.formData === "function") {
          req.formData().then(resolve).catch(reject);
        } else {
          // fallback simples: acumula e parseia limites básicos
          reject(new Error("Envie JSON ou use App Router para multipart."));
        }
      }).catch(()=>null);

      if (form) {
        const raw = form.get("payload");
        if (raw) payload = JSON.parse(typeof raw.text === "function" ? await raw.text() : raw.toString());
      } else {
        // se não der para multipart, cai para JSON
        const chunks = [];
        for await (const c of req) chunks.push(c);
        payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      }
    } else {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    }

    const model = payload?.model || "gpt-5";
    const messages = payload?.messages || [];

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
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
      const lines = chunk.split("\n").filter(Boolean);
      for (const line of lines) if (line.startsWith("data:")) res.write(line + "\n\n");
    }

    res.write('data: {"type":"done"}\n\n');
    res.end();
  } catch (err) {
    console.error("Erro /api/ask:", err);
    res.status(500).json({ error: err?.message || "Erro interno" });
  }
}
