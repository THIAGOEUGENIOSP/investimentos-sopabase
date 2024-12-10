
const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware para CORS
app.use(cors()); // Permite CORS de qualquer origem

// Middleware para JSON
app.use(express.json());

// Configuração do Oracle
const dbConfig = {
  user: "PROD_JD",
  password: "Security11",
  connectString: "localhost/XEPDB1",
};

// Endpoint para buscar investimentos
app.get("/investimentos", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT CATEGORIA, SUM(VALOR) AS VALOR FROM INVESTIMENTOS GROUP BY CATEGORIA`,
      [], // Query que retorna o total por categoria
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("Dados retornados da consulta:", result.rows); // Verifique os dados aqui

    // Formatar os dados antes de enviar
    const formattedRows = result.rows.map((row) => ({
      categoria: row.CATEGORIA,
      valor: row.VALOR,
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Erro ao fechar a conexão:", closeError);
      }
    }
  }
});

// Endpoint para retornar os dados de anos_investimentos
// Endpoint para obter os dados da tabela anos_investimentos
app.get("/anos_investimentos", async (req, res) => {
  let connection;
  try {
    // Estabelece a conexão com o banco de dados
    connection = await oracledb.getConnection(dbConfig);

    // Executa a consulta para retornar os anos e valores acumulados
    const query = `
      SELECT ANO, VALOR 
      FROM ANOS_INVESTIMENTOS 
      ORDER BY ANO
    `;
    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log("Dados retornados da consulta anos_investimentos:", result.rows); // Log dos dados crus

    // Formatar os dados antes de enviar
    const formattedRows = result.rows.map((row) => ({
      ano: row.ANO,
      valor: row.VALOR,
    }));

    console.log("Dados formatados para envio:", formattedRows); // Log dos dados formatados

    res.status(200).json(formattedRows); // Envia os dados no formato JSON
  } catch (error) {
    // Log detalhado do erro para diagnóstico
    console.error("Erro ao buscar dados de anos_investimentos:", error);
    res.status(500).send({ error: error.message });
  } finally {
    // Certifica-se de que a conexão será fechada
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Erro ao fechar a conexão:", closeError);
      }
    }
  }
});







app.post("/investimentos", async (req, res) => {
  // Corrigido para a rota sem o 'http://localhost:3000'
  const { categoria, valor } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Atualizar o valor do investimento somando o valor atual com o novo valor
    await connection.execute(
      `UPDATE investimentos
       SET valor = valor + :valor, dataAporte = SYSDATE
       WHERE categoria = :categoria`,
      {
        categoria,
        valor,
      }
    );

    // Confirmar as mudanças
    await connection.commit();
    res.status(200).send("Aporte adicionado com sucesso!");
  } catch (err) {
    console.error("Erro ao adicionar o aporte:", err);
    res.status(500).send("Erro ao adicionar o aporte");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Erro ao fechar a conexão:", closeError);
      }
    }
  }
});





// Endpoint DELETE para remover um investimento pelo ID
app.delete("/investimentos/:id", async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // Verificar se o investimento existe antes de remover
    const result = await connection.execute(
      `SELECT ID FROM INVESTIMENTOS WHERE ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      // Remover o investimento
      await connection.execute(`DELETE FROM INVESTIMENTOS WHERE ID = :id`, {
        id,
      });
      await connection.commit();
      res.status(200).send("Investimento deletado com sucesso!");
    } else {
      res.status(404).send("Investimento não encontrado");
    }
  } catch (err) {
    console.error("Erro ao deletar o investimento:", err);
    res.status(500).send({ error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Erro ao fechar a conexão:", closeError);
      }
    }
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
