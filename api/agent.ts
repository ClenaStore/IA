import OpenAI from "openai";

export const config = { runtime: "edge" };

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(request: Request) {
  try {
    const isPost = request.method === "POST";
    const body = isPost ? await request.json().catch(() => ({})) : {};
    const url = new URL(request.url);
    const q = body.q || url.searchParams.get("q") || "Diga olá.";

    const resp = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: "Você é um agente do Grupo DV. Responda em PT-BR, direto ao ponto." },
        { role: "user", content: q }
      ]
    });

    const text = (resp as any).output_text ?? JSON.stringify(resp);
    return json({ ok: true, text });
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
