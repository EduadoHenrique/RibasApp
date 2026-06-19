/**
 * perfil_adimin.js — Perfil do Administrador (troca de senha)
 *
 * Atenção: o Administrador não corresponde a um documento "User" no
 * backend (não há rota de cadastro de admin), por isso os dados pessoais
 * exibidos aqui vêm apenas do que o login retornou (nome/matrícula),
 * sem busca adicional. A troca de senha usa PUT /auth/change-password.
 */

window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Banner de primeiro login
  if (RibasAuth.checkFirstLoginBanner()) {
    const banner = document.getElementById("firstLoginBanner");
    if (banner) { banner.classList.add("visible"); }
    setTimeout(() => document.getElementById("novaSenha")?.focus(), 400);
  }

  document.getElementById("adminNome").value  = user.nome      || "-";
  document.getElementById("adminId").value    = user.matricula || "-";
  document.getElementById("adminEmail").value = user.email     || "-";
  document.getElementById("adminNivel").value = "Administrador Master";

  document.getElementById("updatePasswordBtn").addEventListener("click", async () => {
    const nova     = document.getElementById("novaSenha").value;
    const confirma = document.getElementById("confirmaSenha").value;

    if (!nova || !confirma) { alert("Preencha os dois campos para alterar sua senha."); return; }
    if (nova.length < 6)    { alert("A senha deve ter pelo menos 6 caracteres."); return; }
    if (nova !== confirma)  { alert("Erro: As senhas digitadas não batem."); return; }

    try {
      await RibasAuth.markPasswordChanged(nova);
      alert("Senha administrativa atualizada com sucesso!");
      document.getElementById("firstLoginBanner")?.classList.remove("visible");
      document.getElementById("novaSenha").value    = "";
      document.getElementById("confirmaSenha").value = "";
    } catch (error) {
      alert("Não foi possível atualizar a senha: " + error.message);
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());
});
