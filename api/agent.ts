// api/agent.ts
import OpenAI from "openai";

export const config = { runtime: "edge" };

// pegue a chave das variáveis de ambiente da Vercel
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return json({ ok: false, error: "OPENAI_API_KEY ausente nas variáveis de ambiente." }, 500);
    }

    // lê a pergunta do body (POST) ou querystring (GET)
    const url = new URL(request.url);
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const q = body?.q || url.searchParams.get("q") || "Diga olá em uma frase curta.";

    // prompt básico
    const system = {
      role: "system",
      content:
        "Você é um agente do Grupo DV. Responda em PT-BR, direto ao ponto, claro e útil.",
    };

    // chamada à OpenAI (Responses API)
    const resp = await client.responses.create({
      model: "gpt-4o-mini",
      input: [system as any, { role: "user", content: q }],
    });

    const text = (resp as any).output_text ?? JSON.stringify(resp);
    return json({ ok: true, text });
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
}
