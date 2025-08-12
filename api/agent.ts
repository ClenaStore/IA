// api/agent.ts
import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Método não permitido" });
    }

    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => {
        try {
          resolve(JSON.parse(data || "{}"));
        } catch (err) {
          reject(err);
        }
      });
    });

    const { q } = body as { q?: string };
    if (!q) {
      return res.status(400).json({ ok: false, error: "Pergunta vazia" });
    }

    // Configuração OpenAI usando variável de ambiente
    const openai = new OpenAIApi(
      new Configuration({ apiKey: process.env.OPENAI_API_KEY })
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
