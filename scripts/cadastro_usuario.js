const saveOperator = document.getElementById("saveOperator");
const logoutBtn = document.getElementById("logoutBtn");
const deleteSection = document.getElementById("deleteSection");
const deleteOperator = document.getElementById("deleteOperator");

// Captura o parâmetro userId da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = parseInt(urlParams.get("userId")) || 0;

const operators = JSON.parse(localStorage.getItem("operators")) || [];

// userId > 0 = edição; userId === 0 = novo cadastro
const isEdit = userId > 0;
const operatorIndex = userId - 1;

// Exibe o badge com o ID
const userIdBadge = document.getElementById("userIdBadge");
if (isEdit) {
  userIdBadge.textContent = `ID: ${userId}`;
  document.getElementById("formTitle").innerText = "Editar Operador";
  document.getElementById("formBadge").innerText = "Edição RH";
  deleteSection.style.display = "block";
} else {
  userIdBadge.textContent = "ID: Novo";
}

// Preenche os campos se for edição
if (isEdit && operators[operatorIndex]) {
  const op = operators[operatorIndex];
  document.getElementById("nome").value = op.nome || "";
  document.getElementById("matricula").value = op.matricula || "";
  document.getElementById("funcao").value = op.funcao || "";
  document.getElementById("telefone").value = op.telefone || "";
  document.getElementById("cnh").value = op.cnh || "A";
  document.getElementById("validadeCnh").value = op.validadeCnh || "";
  document.getElementById("aso").value = op.aso || "";
  document.getElementById("treinamento").value = op.treinamento || "";
  document.getElementById("validadeTreinamento").value = op.validadeTreinamento || "";
  document.getElementById("status").value = op.status || "Ativo";
} else if (isEdit && !operators[operatorIndex]) {
  alert("Operador não encontrado.");
  window.location.href = "rh.html";
}

// Salvar
saveOperator.addEventListener("click", () => {
  const operator = {
    nome: value("nome"),
    matricula: value("matricula"),
    funcao: value("funcao"),
    telefone: value("telefone"),
    cnh: value("cnh"),
    validadeCnh: value("validadeCnh"),
    aso: value("aso"),
    treinamento: value("treinamento"),
    validadeTreinamento: value("validadeTreinamento"),
    status: value("status")
  };

  if (!operator.nome || !operator.matricula) {
    alert("Preencha os campos obrigatórios: Nome e Matrícula.");
    return;
  }

  const allOperators = JSON.parse(localStorage.getItem("operators")) || [];

  if (isEdit) {
    allOperators[operatorIndex] = operator;
    alert("Operador atualizado com sucesso!");
  } else {
    allOperators.push(operator);
    alert("Operador cadastrado com sucesso!");
  }

  localStorage.setItem("operators", JSON.stringify(allOperators));
  window.location.href = "rh.html";
});

// Excluir
if (deleteOperator) {
  deleteOperator.addEventListener("click", () => {
    const confirma = confirm(`Deseja excluir permanentemente o operador "${operators[operatorIndex]?.nome}"?`);
    if (!confirma) return;

    const allOperators = JSON.parse(localStorage.getItem("operators")) || [];
    allOperators.splice(operatorIndex, 1);
    localStorage.setItem("operators", JSON.stringify(allOperators));
    alert("Operador excluído.");
    window.location.href = "rh.html";
  });
}

// Logout
logoutBtn.addEventListener("click", () => RibasAuth.logout());

function value(id) {
  return document.getElementById(id).value;
}
