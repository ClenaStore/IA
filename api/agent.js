export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const pergunta = req.method === 'POST' ? req.body.q : req.query.q;

  if (!pergunta) {
    return res.status(400).json({ erro: 'Nenhuma pergunta recebida.' });
  }

  const resposta = {
    sucesso: true,
    mensagem: "API funcionando!",
    perguntaRecebida: pergunta
  };

  res.status(200).json(resposta);
}
