export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || 'ping';

    return new Response(
      JSON.stringify({ ok: true, echo: q }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
