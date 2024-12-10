const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");


dotenv.config(); // Carrega as variáveis de ambiente

const app = express();
const PORT = 3000;

// Middleware para JSON e CORS
app.use(cors());
app.use(express.json());

// Configuração do Supabase
const supabaseUrl = "https://kvoufauowkfobwpzhfl.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY; // Carrega da variável de ambiente
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota: Buscar investimentos agrupados por categoria
// Rota: Buscar investimentos agrupados por categoria
app.get("/investimentos", async (req, res) => {
  try {
    console.log("Iniciando consulta aos investimentos...");
    const { data, error } = await supabase
      .from("investimentos")
      .select("categoria, sum(valor) as valor")
      .groupBy("categoria");

    // Se houver erro na consulta
    if (error) {
      console.error("Erro no Supabase:", error);
      throw error;
    }

    console.log("Dados retornados:", data);

    const formattedData = data.map((row) => ({
      categoria: row.categoria,
      valor: row.valor,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Erro ao buscar dados:", err); // Log detalhado do erro
    res.status(500).send({ error: err.message });
  }
});



// Rota: Buscar dados da tabela anos_investimentos
app.get("/anos_investimentos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("anos_investimentos") // Nome da tabela no Supabase
      .select("*")
      .order("ano");

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error("Erro ao buscar dados de anos_investimentos:", err);
    res.status(500).send({ error: err.message });
  }
});

// Rota: Adicionar novo investimento
app.post("/investimentos", async (req, res) => {
  const { categoria, valor } = req.body;

  try {
    // Tenta buscar um investimento já existente para a categoria
    const { data: existingInvestment, error: fetchError } = await supabase
      .from("investimentos")
      .select("*")
      .eq("categoria", categoria)
      .single(); // .single() garante que buscamos apenas um registro

    // Se ocorrer algum erro na busca
    if (fetchError) {
      console.error("Erro ao buscar o investimento:", fetchError);
      return res.status(500).send("Erro ao buscar investimento");
    }

    // Se o investimento já existir (encontramos um registro)
    if (existingInvestment) {
      // Soma o valor existente com o novo valor
      const updatedValor = parseFloat(existingInvestment.valor) + valor;

      // Atualiza o valor do investimento existente
      const { error: updateError } = await supabase
        .from("investimentos")
        .update({
          valor: updatedValor,
          dataaporte: new Date().toISOString().split("T")[0],
        })
        .eq("categoria", categoria);

      // Se ocorrer erro no update
      if (updateError) {
        console.error("Erro ao atualizar o investimento:", updateError);
        return res.status(500).send("Erro ao atualizar o investimento");
      }

      return res.status(200).send("Aporte adicionado com sucesso!");
    }

    // Se o investimento não existir (não encontramos o registro)
    else {
      // Cria um novo investimento com o valor especificado
      const { error: insertError } = await supabase
        .from("investimentos")
        .insert([
          {
            categoria,
            valor,
            dataaporte: new Date().toISOString().split("T")[0], // Data atual
          },
        ]);

      // Se ocorrer erro no insert
      if (insertError) {
        console.error("Erro ao adicionar o novo investimento:", insertError);
        return res.status(500).send("Erro ao adicionar o novo investimento");
      }

      return res.status(201).send("Novo aporte criado com sucesso!");
    }
  } catch (error) {
    console.error("Erro ao adicionar o aporte:", error);
    return res.status(500).send("Erro ao adicionar o aporte");
  }
});




// Rota: Deletar investimento pelo ID
app.delete("/investimentos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("investimentos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).send("Investimento deletado com sucesso!");
  } catch (err) {
    console.error("Erro ao deletar investimento:", err);
    res.status(500).send({ error: err.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


