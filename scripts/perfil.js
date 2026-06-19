/**
 * perfil.js — Perfil do usuário RH (visualização + troca de senha)
 * Busca os dados completos via RibasAPI.Users.getById, já que o login
 * só retorna id/nome/matricula/cargo.
 */

window.addEventListener("DOMContentLoaded", async () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    const banner = document.getElementById("firstLoginBanner");
    if (banner) { banner.classList.add("visible"); }
    setTimeout(() => document.getElementById("novaSenha")?.focus(), 400);
  }

  document.getElementById("perfilId").textContent = user.matricula || "RH";

  let perfil = user;
  try {
    perfil = await RibasAPI.Users.getById(user.id);
  } catch (error) {
    // Mantém os dados básicos do login se a busca completa falhar
  }

  document.getElementById("perfNome").value          = perfil.nome                 || "-";
  document.getElementById("perfMatricula").value     = perfil.matricula            || "-";
  document.getElementById("perfFuncao").value        = perfil.cargo                || "-";
  document.getElementById("perfTelefone").value      = perfil.telefone             || "-";
  document.getElementById("perfCnh").value           = perfil.cnh ? `Categoria ${perfil.cnh}` : "-";
  document.getElementById("perfValidadeCnh").value   = formatDate(perfil.validadeCNH);
  document.getElementById("perfAso").value            = perfil.aso ? "Em dia" : "Pendente";
  document.getElementById("perfTreinamento").value   = perfil.treinamento ? "Concluído" : "Pendente";
  document.getElementById("perfValidadeTreinamento").value = formatDate(perfil.validadeTreinamento);
  document.getElementById("perfStatus").value        = perfil.status               || "-";

  function formatDate(d) {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString("pt-BR");
  }

  document.getElementById("savePassword").addEventListener("click", async () => {
    const nova     = document.getElementById("novaSenha").value;
    const confirma = document.getElementById("confirmaSenha").value;

    if (!nova || !confirma) { alert("Por favor, preencha ambos os campos de senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("As senhas não coincidem. Tente novamente."); return; }

    try {
      await RibasAuth.markPasswordChanged(nova);
      alert("Senha atualizada com sucesso!");
      document.getElementById("firstLoginBanner")?.classList.remove("visible");
      document.getElementById("novaSenha").value    = "";
      document.getElementById("confirmaSenha").value = "";
    } catch (error) {
      alert("Não foi possível atualizar a senha: " + error.message);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
