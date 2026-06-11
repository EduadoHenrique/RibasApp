window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    const banner = document.getElementById("firstLoginBanner");
    if (banner) { banner.classList.add("visible"); }
    setTimeout(() => document.getElementById("novaSenha")?.focus(), 400);
  }

  // Dados do usuário RH
  document.getElementById("perfilId").textContent    = user.matricula || "RH";
  document.getElementById("perfNome").value          = user.nome                 || "-";
  document.getElementById("perfMatricula").value     = user.matricula            || "-";
  document.getElementById("perfFuncao").value        = user.funcao               || "-";
  document.getElementById("perfTelefone").value      = user.telefone             || "-";
  document.getElementById("perfCnh").value           = user.cnh ? `Categoria ${user.cnh}` : "-";
  document.getElementById("perfValidadeCnh").value   = formatDate(user.validadeCnh);
  document.getElementById("perfAso").value           = formatDate(user.aso);
  document.getElementById("perfTreinamento").value   = user.treinamento          || "-";
  document.getElementById("perfValidadeTreinamento").value = formatDate(user.validadeTreinamento);
  document.getElementById("perfStatus").value        = user.status               || "-";

  function formatDate(d) {
    if (!d) return "-";
    if (d.includes("/")) return d;
    const [y, m, dd] = d.split("-");
    return (y && m && dd) ? `${dd}/${m}/${y}` : d;
  }

  document.getElementById("savePassword").addEventListener("click", () => {
    const nova     = document.getElementById("novaSenha").value;
    const confirma = document.getElementById("confirmaSenha").value;

    if (!nova || !confirma) { alert("Por favor, preencha ambos os campos de senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("As senhas não coincidem. Tente novamente."); return; }

    RibasAuth.markPasswordChanged(nova);
    alert("Senha atualizada com sucesso!");
    document.getElementById("firstLoginBanner")?.classList.remove("visible");
    document.getElementById("novaSenha").value    = "";
    document.getElementById("confirmaSenha").value = "";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
