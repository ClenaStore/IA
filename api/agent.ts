export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    return new Response(
      JSON.stringify({ ok: true, message: "API funcionando" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
