export const config = { runtime: "edge" };
export default async function handler(request: Request) {
  return new Response(JSON.stringify({ ok: true, msg: "API Edge funcionando!" }), {
    headers: { "content-type": "application/json" }
  });
}
