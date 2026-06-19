/**
 * cadastro_usuario.js — Cadastro/edição de usuário (User no backend)
 *
 * Usa RibasAPI.Users (POST/GET/PUT/DELETE /users).
 *
 * O nível de acesso (tipoUsuario: OPERADOR/GESTOR/ADMIN) só é definido na
 * criação, porque PUT /users/:id atualiza apenas o documento "User" no
 * backend — não existe rota para alterar o tipoUsuario de um login já
 * existente. Por isso o seletor de nível de acesso só aparece no cadastro
 * de um usuário novo.
 */

const saveOperator = document.getElementById("saveOperator");
const logoutBtn = document.getElementById("logoutBtn");
const deleteSection = document.getElementById("deleteSection");
const deleteOperator = document.getElementById("deleteOperator");
const tipoUsuarioGroup = document.getElementById("tipoUsuarioGroup");
const tipoUsuarioAviso = document.getElementById("tipoUsuarioAviso");

// Captura o parâmetro userId (na verdade, o _id do Mongo) da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");
const isEdit = !!userId && userId !== "0";

const userIdBadge = document.getElementById("userIdBadge");

async function init() {
  if (isEdit) {
    userIdBadge.textContent = `ID: ${userId}`;
    document.getElementById("formTitle").innerText = "Editar Operador";
    document.getElementById("formBadge").innerText = "Edição RH";
    deleteSection.style.display = "block";

    // Nível de acesso não pode ser alterado na edição
    tipoUsuarioGroup.style.display = "none";
    tipoUsuarioAviso.style.display = "block";

    try {
      const op = await RibasAPI.Users.getById(userId);
      document.getElementById("nome").value = op.nome || "";
      document.getElementById("matricula").value = op.matricula || "";
      document.getElementById("funcao").value = op.cargo || "";
      document.getElementById("telefone").value = op.telefone || "";
      document.getElementById("cnh").value = op.cnh || "A";
      document.getElementById("validadeCnh").value = toDateInputValue(op.validadeCNH);
      document.getElementById("aso").checked = !!op.aso;
      document.getElementById("treinamento").checked = !!op.treinamento;
      document.getElementById("validadeTreinamento").value = toDateInputValue(op.validadeTreinamento);
      document.getElementById("status").value = op.status || "Ativo";
    } catch (error) {
      alert("Operador não encontrado: " + error.message);
      window.location.href = "rh.html";
    }
  } else {
    userIdBadge.textContent = "ID: Novo";
  }
}

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  return d.toISOString().slice(0, 10);
}

// Salvar
saveOperator.addEventListener("click", async () => {
  const operator = {
    nome: value("nome"),
    matricula: value("matricula"),
    cargo: value("funcao"),
    telefone: value("telefone"),
    cnh: value("cnh"),
    validadeCNH: value("validadeCnh") || undefined,
    aso: document.getElementById("aso").checked,
    treinamento: document.getElementById("treinamento").checked,
    validadeTreinamento: value("validadeTreinamento") || undefined,
    status: value("status")
  };

  if (!isEdit) {
    operator.tipoUsuario = value("tipoUsuario");
  }

  if (!operator.nome || !operator.matricula) {
    alert("Preencha os campos obrigatórios: Nome e Matrícula.");
    return;
  }

  saveOperator.disabled = true;

  try {
    if (isEdit) {
      await RibasAPI.Users.update(userId, operator);
      alert("Operador atualizado com sucesso!");
    } else {
      const result = await RibasAPI.Users.create(operator);
      alert(
        "Usuário cadastrado com sucesso!\n\n" +
        "Senha temporária gerada: " + (result.senhaTemporaria || "(verifique com o administrador)")
      );
    }
    window.location.href = "rh.html";
  } catch (error) {
    alert("Não foi possível salvar o usuário: " + error.message);
  } finally {
    saveOperator.disabled = false;
  }
});

// Excluir (desativa o usuário — DELETE /users/:id faz soft delete no backend)
if (deleteOperator) {
  deleteOperator.addEventListener("click", async () => {
    const confirma = confirm("Deseja desativar permanentemente este operador?");
    if (!confirma) return;

    try {
      await RibasAPI.Users.remove(userId);
      alert("Operador desativado.");
      window.location.href = "rh.html";
    } catch (error) {
      alert("Não foi possível desativar o operador: " + error.message);
    }
  });
}

// Logout
logoutBtn.addEventListener("click", () => RibasAuth.logout());

function value(id) {
  return document.getElementById(id).value;
}

init();
