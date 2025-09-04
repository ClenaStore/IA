// app/api/ask/route.js
export const runtime = "nodejs"; // (estável para process.env). Se quiser, pode usar "edge".

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders("*") });
}

export async function GET(req) {
  const url = new URL(req.url);
  const ping = url.searchParams.get("ping");
  const diag = url.searchParams.get("diag"); // diagnóstico opcional

  if (ping === "1") {
    return new Response("ok", { status: 200, headers: corsHeaders("*") });
  }

  if (diag === "1") {
    // NÃO expõe a chave, só se existe e em qual runtime está.
    const hasKey = !!process.env.OPENAI_API_KEY;
    return new Response(
      JSON.stringify({ ok: true, hasKey, runtime }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders("*") } }
    );
  }

  return new Response("Use POST em /api/ask", { status: 405, headers: corsHeaders("*") });
}

export async function POST(req) {
  try {
    const headers = corsHeaders("*");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada" }), {
        status: 500, headers: { "Content-Type": "application/json", ...headers }
      });
    }

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

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, { status: upstream.status, headers });
    }

    // Pipe SSE
    const { readable, writable } = new TransformStream();
    (async () => {
      const reader = upstream.body.getReader();
      const writer = writable.getWriter();
      const enc = new TextEncoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value); // repassa as linhas "data: ..."
        }
        await writer.write(enc.encode('data: {"type":"done"}\n\n'));
      } finally { await writer.close(); }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        ...headers
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Erro interno" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders("*") }
    });
  }
}
