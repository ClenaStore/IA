import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const body = req.method === "POST" ? req.body : req.query;
    const q = body?.q || "ping";

    // Aqui você coloca a integração real com a OpenAI, por enquanto só retorna eco
    res.status(200).json({
      ok: true,
      resposta: `Você disse: ${q}`
    });

  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
