import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { q } = req.method === "POST" ? req.body : req.query;
    if (!q) {
      return res.status(400).json({ ok: false, error: "Faltou o parâmetro 'q'" });
    }

    // Aqui vai sua lógica de integração com OpenAI
    res.status(200).json({
      ok: true,
      resposta: `Você disse: ${q}`
    });

  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}
