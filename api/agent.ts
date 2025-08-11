export const config = { runtime: "edge" }; // isto já força Edge
export default async function handler(req: Request) {
  return new Response(JSON.stringify({ ok:true, msg:"Edge OK" }), {
    headers: { "content-type":"application/json" }
  });
}
