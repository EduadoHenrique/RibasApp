/**
 * rh.js — Painel do RH (lista de operadores)
 * Usa RibasAPI.Users (GET /users)
 */

const operatorList = document.getElementById("operatorList");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => RibasAuth.logout());

async function renderOperators() {
  operatorList.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Carregando operadores...</div>`;

  let operators = [];
  try {
    operators = await RibasAPI.Users.list();
  } catch (error) {
    operatorList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #c0392b;">
        <p style="font-size: 1.1rem;">Não foi possível carregar os operadores.</p>
        <p style="font-size: 0.9rem; margin-top: 8px;">${error.message}</p>
      </div>`;
    return;
  }

  operatorList.innerHTML = "";

  let cnhAlert = 0;
  let asoAlert = 0;
  let active = 0;

  if (operators.length === 0) {
    operatorList.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #888;">
        <p style="font-size: 1.1rem;">Nenhum operador cadastrado ainda.</p>
        <a href="cadastro_usuario.html?userId=0" class="save-btn" style="text-decoration: none; display: inline-block; margin-top: 15px;">+ Cadastrar Primeiro Operador</a>
      </div>`;
    updateCounters(0, 0, 0);
    return;
  }

  operators.forEach((operator) => {
    const cnhDays = calculateDays(operator.validadeCNH);
    const asoOk = !!operator.aso;

    if (cnhDays <= 30) cnhAlert++;
    if (!asoOk) asoAlert++;
    if (operator.status === "Ativo") active++;

    operatorList.innerHTML += `
      <div class="operator-card" style="cursor: pointer;" onclick="window.location.href='cadastro_usuario.html?userId=${operator._id}'">
        <div class="operator-top">
          <div>
            <h3>${operator.nome}</h3>
            <p>${operator.cargo || ""}</p>
          </div>
          <div class="status ${statusClass(operator.status)}">
            ${operator.status || "-"}
          </div>
        </div>
        <div class="operator-info">
          <p><strong>Matrícula:</strong> ${operator.matricula}</p>
          <p><strong>CNH:</strong> ${operator.cnh || "-"}</p>
          <p><strong>Treinamento:</strong> ${operator.treinamento ? "Concluído" : "Pendente"}</p>
          <p><strong>Telefone:</strong> ${operator.telefone || "-"}</p>
        </div>
        <div class="alerts">
          ${cnhDays <= 30 ? `<div class="alert warning-alert">CNH vencendo em ${cnhDays} dias</div>` : ""}
          ${!asoOk ? `<div class="alert danger-alert">ASO pendente</div>` : ""}
        </div>
      </div>
    `;
  });

  updateCounters(cnhAlert, asoAlert, active);
}

function updateCounters(cnhAlert, asoAlert, active) {
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
