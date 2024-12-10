// Inicialização dos Gráficos
let barChart, patrimonioChart;

// Função de formatação de moeda
function formatToCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Função para carregar os dados de investimentos e anos
async function loadInvestments() {
  try {
    const headers = {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM", // Substitua por sua anon key do Supabase
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM", // Use a mesma anon key
      "Content-Type": "application/json",
    };

    const responseInvest = await fetch(
      "https://kvoufauowkfobwppzhfl.supabase.co/rest/v1/investimentos",
      { headers }
    );

    if (!responseInvest.ok) {
      throw new Error(
        `Erro ao carregar investimentos: ${responseInvest.statusText}`
      );
    }

    const investData = await responseInvest.json();
    updateBarChart(investData);
    updateInvestmentHistory(investData);

    const responseYear = await fetch(
      "https://kvoufauowkfobwppzhfl.supabase.co/rest/v1/anos_investimentos",
      { headers }
    );

    if (!responseYear.ok) {
      throw new Error("Erro ao carregar anos de investimentos");
    }

    const yearData = await responseYear.json();
    updatePatrimonioChart(yearData);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    alert("Erro ao carregar dados. Tente novamente.");
  }
}



// Atualiza o gráfico de Aportes por Categoria
function updateBarChart(data) {
  const labels = data.map((item) => item.categoria);
  const values = data.map((item) => item.valor);

  barChart.data.labels = labels;
  barChart.data.datasets[0].data = values;
  barChart.update();
}

// Atualiza o gráfico de Patrimônio por Ano
function updatePatrimonioChart(data) {
  const labels = data.map((item) => item.ano.toString());
  const values = data.map((item) => item.valor);

  patrimonioChart.data.labels = labels;
  patrimonioChart.data.datasets[0].data = values;
  patrimonioChart.update();
}

// Função para adicionar investimentos
async function addInvestments() {
  const categorias = [
    { categoria: "Renda Fixa", valor: parseInputValue("rendaFixaInput") },
    { categoria: "FIIs", valor: parseInputValue("fiisInput") },
    { categoria: "Ações", valor: parseInputValue("acoesInput") },
    { categoria: "ETFs", valor: parseInputValue("etfsInput") },
    { categoria: "Criptomoedas", valor: parseInputValue("criptomoedasInput") },
    { categoria: "Tesouro", valor: parseInputValue("tesouroInput") },
  ];

  const categoriasComValor = categorias.filter(({ valor }) => valor > 0);

  if (categoriasComValor.length > 0) {
    try {
      // Verifica se existe um aporte para a categoria, caso contrário insere
      for (const { categoria, valor } of categoriasComValor) {
        // Endpoint para verificar o registro existente
        const checkResponse = await fetch(
          "https://kvoufauowkfobwppzhfl.supabase.co/rest/v1/investimentos?categoria=eq." +
            categoria,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              apikey:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM", // Substitua pela sua chave de API do Supabase
              Authorization:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM", // Pode usar o mesmo valor ou configurar um token separado
            },
          }
        );

        const existingData = await checkResponse.json();

        if (existingData.length > 0) {
          // Atualiza o valor de um investimento existente
          const updatedValor = existingData[0].valor + valor;
          const updateResponse = await fetch(
            `https://kvoufauowkfobwppzhfl.supabase.co/rest/v1/investimentos?id=eq.${existingData[0].id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                apikey:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM",
                Authorization:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM",
              },
              body: JSON.stringify({ valor: updatedValor }),
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Erro ao atualizar o aporte para ${categoria}`);
          }
        } else {
          // Se não encontrar, faz o POST para criar um novo aporte
          const response = await fetch(
            "https://kvoufauowkfobwppzhfl.supabase.co/rest/v1/investimentos",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM",
                Authorization:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2b3VmYXVvd2tmb2J3cHB6aGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4MzU5NTAsImV4cCI6MjA0OTQxMTk1MH0.z-TjtKQroIZIt_g5P3hFUmjP1-M8m7Cw8r3-R0_OxAM",
              },
              body: JSON.stringify({
                categoria,
                valor,
                dataaporte: new Date().toISOString().split("T")[0], // data atual
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Erro ao adicionar o aporte para ${categoria}`);
          }
        }
      }

      alert("Aportes adicionados com sucesso!");
      loadInvestments(); // Atualizar gráficos após inserção
    } catch (error) {
      console.error("Erro ao adicionar investimentos:", error);
      alert(
        "Erro ao adicionar os investimentos. Verifique o console para mais detalhes."
      );
    }
  } else {
    alert("Por favor, preencha ao menos um valor!");
  }
}




// Função para pegar o valor numérico do input (sem formatação)
function parseInputValue(inputId) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return 0;
  const value = inputElement.value.replace(/\D/g, ""); // Remove tudo que não for número
  return value ? parseFloat(value) / 100 : 0;
}

// Função para atualizar a exibição dos aportes (Histórico de Aportes)
function updateInvestmentHistory(investments) {
  const investmentHistory = {
    "Renda Fixa": 0,
    FIIs: 0,
    Ações: 0,
    ETFs: 0,
    Criptomoedas: 0,
    Tesouro: 0,
  };

  investments.forEach((investment) => {
    if (investmentHistory.hasOwnProperty(investment.categoria)) {
      investmentHistory[investment.categoria] += investment.valor;
    }
  });

  // Atualiza a lista de aportes na tela
  const investmentListElement = document.getElementById(
    "investmentHistoryList"
  );
  investmentListElement.innerHTML = ""; // Limpa a lista antes de adicionar novos elementos

  for (const categoria in investmentHistory) {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item");
    listItem.textContent = `${categoria}: R$ ${investmentHistory[
      categoria
    ].toLocaleString("pt-BR")}`;
    investmentListElement.appendChild(listItem);
  }
}

// Função para formatar o input para exibição com moeda
function formatInput(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove tudo que não for número
  value = (parseInt(value, 10) || 0) / 100; // Divide por 100 para representar decimais
  input.value = formatToCurrency(value); // Formata como moeda
}

// Criação do gráfico de Aportes por Categoria
function createBarChart() {
  const ctx = document.getElementById("investmentBarChart").getContext("2d");

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Aportes (R$)",
          data: [],
          backgroundColor: [
            "#007bff",
            "#ffc107",
            "#dc3545",
            "#28a745",
            "#6610f2",
            "#17a2b8",
          ],
          borderColor: [
            "#007bff",
            "#ffc107",
            "#dc3545",
            "#28a745",
            "#6610f2",
            "#17a2b8",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `R$ ${context.raw.toLocaleString("pt-BR")}`,
          },
        },
      },
    },
  });
}

// Criação do gráfico de Patrimônio por Ano
function createPatrimonioChart() {
  const ctx = document
    .getElementById("investmentHorizontalBarChart")
    .getContext("2d");

  patrimonioChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Patrimônio Acumulado (R$)",
          data: [],
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Barras horizontais
      responsive: true,
      scales: {
        x: { beginAtZero: true },
        y: { title: { display: true, text: "Ano" } },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `R$ ${context.raw.toLocaleString("pt-BR")}`,
          },
        },
      },
    },
  });
}

// Inicializar gráficos e carregar dados
document.addEventListener("DOMContentLoaded", () => {
  createBarChart();
  createPatrimonioChart();
  loadInvestments();
});

// Event Listeners para formatar os inputs
document
  .getElementById("rendaFixaInput")
  .addEventListener("input", (event) => formatInput(event));
document.getElementById("fiisInput").addEventListener("input", formatInput);
document.getElementById("acoesInput").addEventListener("input", formatInput);
document.getElementById("etfsInput").addEventListener("input", formatInput);
document
  .getElementById("criptomoedasInput")
  .addEventListener("input", formatInput);
document.getElementById("tesouroInput").addEventListener("input", formatInput);
