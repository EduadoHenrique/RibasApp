window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    const banner = document.getElementById("firstLoginBanner");
    if (banner) { banner.classList.add("visible"); }
    setTimeout(() => document.getElementById("novaSenha")?.focus(), 400);
  }

  document.getElementById("adminNome").value  = user.nome      || "Gestor de Operações";
  document.getElementById("adminId").value    = user.matricula  || "ADM-7716";
  document.getElementById("adminEmail").value = user.email     || "admin.operacional@ribas.com";
  document.getElementById("adminNivel").value = "Administrador Master";

  document.getElementById("updatePasswordBtn").addEventListener("click", () => {
    const nova     = document.getElementById("novaSenha").value;
    const confirma = document.getElementById("confirmaSenha").value;

    if (!nova || !confirma) { alert("Preencha os dois campos para alterar sua senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("Erro: As senhas digitadas não batem."); return; }

    RibasAuth.markPasswordChanged(nova);
    localStorage.setItem("adminPassword", nova);
    alert("Senha administrativa atualizada com sucesso!");
    document.getElementById("firstLoginBanner")?.classList.remove("visible");
    document.getElementById("novaSenha").value    = "";
    document.getElementById("confirmaSenha").value = "";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
