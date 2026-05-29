const operatorList = document.getElementById("operatorList");
const logoutBtn = document.getElementById("logoutBtn");

// Evento de Logout compartilhado
logoutBtn.addEventListener("click", () => {
  // Insira aqui a lógica de limpar sessão/token se houver
  alert("Deslogando do sistema...");
  window.location.href = "login.html"; // Redirecionamento para tela de login fictícia
});

function renderOperators() {
  const operators = JSON.parse(localStorage.getItem("operators")) || [];
  operatorList.innerHTML = "";

  let cnhAlert = 0;
  let asoAlert = 0;
  let active = 0;

  operators.forEach((operator, index) => {
    const cnhDays = calculateDays(operator.validadeCnh);
    const asoDays = calculateDays(operator.aso);

    if (cnhDays <= 30) cnhAlert++;
    if (asoDays <= 0) asoAlert++;
    if (operator.status === "Ativo") active++;

    // Criamos o card com um evento de clique para ir para a página de edição (passando o índice real + 1 para evitar conflito com o 0 do novo usuário)
    const cardId = index + 1;

    operatorList.innerHTML += `
      <div class="operator-card" style="cursor: pointer;" onclick="window.location.href='formulario.html?userId=${cardId}'">
        <div class="operator-top">
          <div>
            <h3>${operator.nome}</h3>
            <p>${operator.funcao}</p>
          </div>
          <div class="status ${statusClass(operator.status)}">
            ${operator.status}
          </div>
        </div>
        <div class="operator-info">
          <p><strong>Matrícula:</strong> ${operator.matricula}</p>
          <p><strong>CNH:</strong> ${operator.cnh}</p>
          <p><strong>Treinamento:</strong> ${operator.treinamento}</p>
          <p><strong>Telefone:</strong> ${operator.telefone}</p>
        </div>
        <div class="alerts">
          ${cnhDays <= 30 ? `<div class="alert warning-alert">CNH vencendo em ${cnhDays} dias</div>` : ""}
          ${asoDays <= 0 ? `<div class="alert danger-alert">ASO vencido</div>` : ""}
        </div>
      </div>
    `;
  });

  document.getElementById("cnhAlert").innerText = String(cnhAlert).padStart(2, "0");
  document.getElementById("asoAlert").innerText = String(asoAlert).padStart(2, "0");
  document.getElementById("activeOperators").innerText = String(active).padStart(2, "0");
}

function calculateDays(dateString) {
  if (!dateString) return 999;
  const today = new Date();
  const target = new Date(dateString);
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function statusClass(status) {
  if (status === "Ativo") return "green-status";
  if (status === "Bloqueado") return "red-status";
  return "yellow-status";
}

renderOperators();