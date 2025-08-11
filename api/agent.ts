import OpenAI from "openai";

export default async function handler(req: any, res: any) {
  try {
    const body = req.method === "POST" ? req.body : {};
    const prompt = body.q || "Olá, quem é você?";

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.status(200).json({
      ok: true,
      resposta: completion.choices[0].message.content
    });
  } catch (error) {
    res.status(500).json({ ok: false, erro: String(error) });
  }
}
