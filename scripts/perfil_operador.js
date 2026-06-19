/**
 * perfil_operador.js — Perfil do Operador (visualização + troca de senha)
 * Busca os dados completos via RibasAPI.Users.getById, já que o login
 * só retorna id/nome/matricula/cargo.
 */

window.addEventListener("DOMContentLoaded", async () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    document.getElementById("firstLoginBanner").classList.add("visible");
    setTimeout(() => document.getElementById("opNovaSenha")?.focus(), 400);
  }

  document.getElementById("perfilMatricula").textContent = user.matricula || "";

  let perfil = user;
  try {
    perfil = await RibasAPI.Users.getById(user.id);
  } catch (error) {
    // Mantém os dados básicos do login se a busca completa falhar
  }

  document.getElementById("opNome").value                = perfil.nome                 || "-";
  document.getElementById("opMatricula").value           = perfil.matricula            || "-";
  document.getElementById("opFuncao").value              = perfil.cargo                || "-";
  document.getElementById("opTelefone").value            = perfil.telefone             || "-";
  document.getElementById("opCnh").value                 = perfil.cnh ? `Categoria ${perfil.cnh}` : "-";
  document.getElementById("opValidadeCnh").value         = formatDate(perfil.validadeCNH);
  document.getElementById("opAso").value                  = perfil.aso ? "Em dia" : "Pendente";
  document.getElementById("opTreinamento").value         = perfil.treinamento ? "Concluído" : "Pendente";
  document.getElementById("opValidadeTreinamento").value = formatDate(perfil.validadeTreinamento);
  document.getElementById("opStatus").value              = perfil.status               || "-";

  function formatDate(d) {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString("pt-BR");
  }

  // Salvar senha
  document.getElementById("btnSalvarSenha").addEventListener("click", async () => {
    const nova     = document.getElementById("opNovaSenha").value;
    const confirma = document.getElementById("opConfirmaSenha").value;

    if (!nova || !confirma) { alert("Preencha e confirme a nova senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("As senhas não coincidem. Tente novamente."); return; }

    try {
      await RibasAuth.markPasswordChanged(nova);
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
      alert("Senha atualizada com sucesso!");

      document.getElementById("firstLoginBanner").classList.remove("visible");
      document.getElementById("opNovaSenha").value    = "";
      document.getElementById("opConfirmaSenha").value = "";
    } catch (error) {
      alert("Não foi possível atualizar a senha: " + error.message);
    }
  });

  // Voltar
  document.getElementById("btnVoltar").addEventListener("click", () => {
    const map = { admin: "admin.html", rh: "rh.html", operador: "operador.html" };
    window.location.href = map[user.role] || "operador.html";
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
