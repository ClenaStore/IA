export const config = {
  runtime: "edge"
};

export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({ ok: true, message: "API funcionando 🚀" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
