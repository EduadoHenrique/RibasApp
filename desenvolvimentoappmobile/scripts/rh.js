const saveOperator =
  document.getElementById("saveOperator");

const operatorList =
  document.getElementById("operatorList");

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

  const operators =
    JSON.parse(localStorage.getItem("operators")) || [];

  operators.push(operator);

  localStorage.setItem(
    "operators",
    JSON.stringify(operators)
  );

  clearForm();

  renderOperators();
});

function value(id) {
  return document.getElementById(id).value;
}

function clearForm() {

  const fields =
    document.querySelectorAll("input");

  fields.forEach((field) => {
    field.value = "";
  });

}

function renderOperators() {

  const operators =
    JSON.parse(localStorage.getItem("operators")) || [];

  operatorList.innerHTML = "";

  let cnhAlert = 0;
  let asoAlert = 0;
  let active = 0;

  operators.forEach((operator) => {

    const cnhDays =
      calculateDays(operator.validadeCnh);

    const asoDays =
      calculateDays(operator.aso);

    if (cnhDays <= 30) cnhAlert++;
    if (asoDays <= 0) asoAlert++;

    if (operator.status === "Ativo") {
      active++;
    }

    operatorList.innerHTML += `
      <div class="operator-card">

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

          ${
            cnhDays <= 30
              ? `<div class="alert warning-alert">
                  CNH vencendo em ${cnhDays} dias
                </div>`
              : ""
          }

          ${
            asoDays <= 0
              ? `<div class="alert danger-alert">
                  ASO vencido
                </div>`
              : ""
          }

        </div>

      </div>
    `;
  });

  document.getElementById("cnhAlert").innerText =
    String(cnhAlert).padStart(2, "0");

  document.getElementById("asoAlert").innerText =
    String(asoAlert).padStart(2, "0");

  document.getElementById("activeOperators").innerText =
    String(active).padStart(2, "0");
}

function calculateDays(dateString) {

  if (!dateString) return 999;

  const today = new Date();

  const target =
    new Date(dateString);

  const diff =
    target - today;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}

function statusClass(status) {

  if (status === "Ativo") {
    return "green-status";
  }

  if (status === "Bloqueado") {
    return "red-status";
  }

  return "yellow-status";
}

renderOperators();