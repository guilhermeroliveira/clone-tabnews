import database from "infra/database.js";

async function status(request, response) {
  await database.query("SELECT 1 as res;");
  response.status(200).json({ "mensagem": "alunos do curso.dev são pessoas acima da média" });
}

export default status;
