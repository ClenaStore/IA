// app/api/ask/route.js  (Next.js App Router)
// Requisitos: Vercel + variável OPENAI_API_KEY
export const runtime = "edge"; // ou "nodejs" se preferir

export async function GET(req) {
  // Suporta o botão "Testar conexão"
  const { searchParams } = new URL(req.url);
  if (searchParams.get("ping") === "1") return new Response("ok", { status: 200 });
  return new Response("Use POST em /api/ask", { status: 405 });
}

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }

    // Aceita JSON ou multipart com 'payload'
    const ctype = req.headers.get("content-type") || "";
    let payload = {};
    if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      const raw = form.get("payload");
      if (raw) payload = JSON.parse(await raw.text());
      // se quiser: const file0 = form.get("file0");
    } else {
      payload = await req.json();
    }

    const model = payload?.model || "gpt-5";
    const messages = payload?.messages || [];

    // Chamada à OpenAI com stream
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, { status: upstream.status });
    }

    // Pipe do stream (SSE) para o cliente
    const { readable, writable } = new TransformStream();
    (async () => {
      const reader = upstream.body.getReader();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // repassa os mesmos chunks SSE recebidos
          await writer.write(value);
        }
        await writer.write(encoder.encode('data: {"type":"done"}\n\n'));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
