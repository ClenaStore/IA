// api/agent.js
export default async function handler(req, res) {
  try {
    // Suporta POST (body) e GET (query) para você poder testar no navegador também
    let body = {};
    if (req.method === 'POST') {
      if (typeof req.body === 'object') body = req.body;
      else body = JSON.parse(req.body || '{}');
    } else {
      body = req.query || {};
    }

    const q = body.q || 'ping';

    res.setHeader('content-type', 'application/json; charset=utf-8');
    return res.status(200).json({ ok: true, text: `eco: ${q}` });
  } catch (e) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
