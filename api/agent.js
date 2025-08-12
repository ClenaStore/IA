export default function handler(req, res) {
  const pergunta = req.query.q || "nada recebido";

  res.status(200).json({
    sucesso: true,
    mensagem: "API funcionando!",
    perguntaRecebida: pergunta
  });
}
