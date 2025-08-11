import OpenAI from "openai";

export const config = { runtime: "edge" };

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(request: Request) {
  try {
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const content = body?.q ?? body?.content ?? body?.message ?? "";
      const userMsg = typeof content === "string" && content ? content : "Diga 'olá'.";
      const system = {
        role: "system",
        content: "Você é um agente do Grupo DV. Responda em PT-BR de forma objetiva e útil."
      };

      const resp = await client.responses.create({
        model: "gpt-5",
        input: [system, { role: "user", content: userMsg }]
      });

      const text = (resp as any).output_text ?? JSON.stringify(resp);
      return json({ ok: true, text });
    }

    // GET simples com ?q=
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || "Diga 'olá'.";
    const resp = await client.responses.create({
      model: "gpt-5",
      input: [{ role: "system", content: "Responda em PT-BR." }, { role: "user", content: q }]
    });
    const text = (resp as any).output_text ?? JSON.stringify(resp);
    return json({ ok: true, text });
  } catch (err: any) {
    return json({ ok: false, error: String(err?.message || err) }, 500);
  }
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" }
  });
}
