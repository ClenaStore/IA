// api/agent.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { q } = (req.method === "POST" ? (req.body || {}) : req.query) as any;
    const echo = q || "ping";
    res.status(200).json({ ok: true, echo });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
