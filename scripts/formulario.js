const saveOperator = document.getElementById("saveOperator");
const logoutBtn = document.getElementById("logoutBtn");

// Captura os parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = parseInt(urlParams.get("userId")) || 0;

const operators = JSON.parse(localStorage.getItem("operators")) || [];

// Se userId > 0, estamos editando um operador existente (ajustando o index)
const isEdit = userId > 0;
const operatorIndex = userId - 1;

// Preenche os campos caso seja edição
if (isEdit && operators[operatorIndex]) {
  const op = operators[operatorIndex];
  document.getElementById("formTitle").innerText = "Editar Operador";
  document.getElementById("formBadge").innerText = "Edição RH";
  
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
}

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
    alert("Preencha os campos obrigatórios.");
    return;
  }

  if (isEdit) {
    operators[operatorIndex] = operator; // Atualiza o existente
  } else {
    operators.push(operator); // Adiciona um novo
  }

  localStorage.setItem("operators", JSON.stringify(operators));
  window.location.href = "rh.html"; // Retorna para a listagem principal
});

logoutBtn.addEventListener("click", () => {
  alert("Deslogando do sistema...");
  window.location.href = "login.html";
});

function value(id) {
  return document.getElementById(id).value;
}