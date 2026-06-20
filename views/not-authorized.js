/**
 * views/not-authorized.js — Acesso negado
 */

export function template() {
  return `
  <main class="admin-body" style="min-height:100vh; display:flex; align-items:center; justify-content:center;">
    <div style="text-align:center; max-width:500px; padding:40px;">

      <div style="font-size:64px; margin-bottom:24px;">🚫</div>

      <div class="mini-badge" style="display:inline-block; margin-bottom:16px;">Acesso Restrito</div>
      <h1 class="dashboard-title" style="font-size:72px; margin-bottom:20px;">Acesso Negado</h1>

      <p style="color:#666; font-size:1.1rem; line-height:1.7; margin-bottom:32px;">
        Você não tem permissão para acessar esta área.<br>
        Se acredita que isso é um erro, entre em contato com o administrador do sistema.
      </p>

      <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
        <button class="save-btn" id="btnHome">← Voltar ao Painel</button>
        <button class="save-btn" id="btnLogout" style="background:#c62828;">Sair do Sistema</button>
      </div>

    </div>
  </main>
  `;
}

export function init() {
  const user = RibasAPI.session.getUser();

  document.getElementById("btnHome").addEventListener("click", () => {
    window.location.hash = user ? "home" : "login";
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    RibasAPI.Auth.logout();
    window.location.hash = "login";
  });
}
