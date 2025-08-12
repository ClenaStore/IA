export default function handler(req, res) {
  // Se quiser testar parâmetros
  const pergunta = req.query.q || "Nenhuma pergunta recebida";

  // Retorno em JSON válido
  res.status(200).json({
    sucesso: true,
    mensagem: "API funcionando!",
    perguntaRecebida: pergunta
  });
}
