import { Configuration, OpenAIApi } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Método não permitido" });
    }

    const { q } = req.body || {};
    if (!q) {
      return res.status(400).json({ ok: false, error: "Pergunta vazia" });
    }

    const openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      })
    );

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: q }],
    });

    const resposta = completion.data.choices[0]?.message?.content || "";

    res.status(200).json({ ok: true, text: resposta });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
