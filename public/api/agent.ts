export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  return new Response(JSON.stringify({ ok: true, msg: "Edge OK" }), {
    headers: { "content-type": "application/json" }
  });
}
