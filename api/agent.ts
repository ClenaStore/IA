export const config = { runtime: "edge" };

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request) {
  try {
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const q = body.q || new URL(request.url).searchParams.get("q") || "ping";
    return json({ ok: true, echo: q });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}
