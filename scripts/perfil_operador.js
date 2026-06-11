window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    document.getElementById("firstLoginBanner").classList.add("visible");
    // Foca no campo de senha automaticamente
    setTimeout(() => document.getElementById("opNovaSenha").focus(), 400);
  }

  // Preenche dados pessoais
  document.getElementById("perfilMatricula").textContent = user.matricula || "";
  document.getElementById("opNome").value                = user.nome                 || "-";
  document.getElementById("opMatricula").value           = user.matricula            || "-";
  document.getElementById("opFuncao").value              = user.funcao               || "-";
  document.getElementById("opTelefone").value            = user.telefone             || "-";
  document.getElementById("opCnh").value                 = user.cnh ? `Categoria ${user.cnh}` : "-";
  document.getElementById("opValidadeCnh").value         = formatDate(user.validadeCnh);
  document.getElementById("opAso").value                 = formatDate(user.aso);
  document.getElementById("opTreinamento").value         = user.treinamento          || "-";
  document.getElementById("opValidadeTreinamento").value = formatDate(user.validadeTreinamento);
  document.getElementById("opStatus").value              = user.status               || "-";

  function formatDate(d) {
    if (!d) return "-";
    if (d.includes("/")) return d;
    const [y, m, dd] = d.split("-");
    return (y && m && dd) ? `${dd}/${m}/${y}` : d;
  }

  // Salvar senha
  document.getElementById("btnSalvarSenha").addEventListener("click", () => {
    const nova     = document.getElementById("opNovaSenha").value;
    const confirma = document.getElementById("opConfirmaSenha").value;

    if (!nova || !confirma) { alert("Preencha e confirme a nova senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("As senhas não coincidem. Tente novamente."); return; }

    const updated = RibasAuth.markPasswordChanged(nova);
    if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
    alert("Senha atualizada com sucesso!");

    // Remove banner de primeiro login se ainda visível
    document.getElementById("firstLoginBanner").classList.remove("visible");
    document.getElementById("opNovaSenha").value    = "";
    document.getElementById("opConfirmaSenha").value = "";
  });

  // Voltar
  document.getElementById("btnVoltar").addEventListener("click", () => {
    const map = { admin: "admin.html", rh: "rh.html", operador: "operador.html" };
    window.location.href = map[user.role] || "operador.html";
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
