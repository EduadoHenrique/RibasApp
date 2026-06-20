/**
 * views/login.js — Tela de login
 */

export function template() {
  return `
  <main class="screen">

    <section class="hero">
      <div>
        <div class="logo">
          <div class="logo-icon">⚙️</div>
          <div>
            <div class="logo-name">RIBAS APP</div>
            <div class="logo-sub">Gestão Industrial · SENAI PR</div>
          </div>
        </div>

        <div class="hero-content">
          <div class="hero-badge">
            <div class="pulse"></div>
            Sistema operacional ativo
          </div>
          <h1>Gestão de frotas e documentos industriais</h1>
          <p>Plataforma industrial desenvolvida para controle operacional de guindastes, certificações, checklists e documentação.</p>
        </div>
      </div>

      <div class="hero-footer">
        <span>Ribas App v2.0 Industrial</span>
        <span>Uni Senai PR · Afonso Pena</span>
      </div>
    </section>

    <section class="login-side">
      <div class="login-card">
        <div class="card-top">
          <div class="card-mini">Acesso corporativo</div>
          <h2 class="card-title">Entrar no sistema</h2>
          <p class="card-text">Utilize suas credenciais corporativas para acessar o sistema.</p>
        </div>

        <div class="form-group">
          <label>Matrícula / Usuário</label>
          <div class="input-wrap">
            <input type="text" id="matricula" placeholder="000123">
          </div>
        </div>

        <div class="form-group">
          <label>Senha</label>
          <div class="input-wrap">
            <input type="password" id="senha" placeholder="••••••••">
          </div>
        </div>

        <div id="loginError" style="display:none; color:#c0392b; font-size:0.85rem; margin-top:4px; margin-bottom:8px;"></div>

        <button class="btn-login" id="loginBtn">Entrar no sistema</button>

        <div class="bottom-links">
          <a href="#">Esqueci minha senha</a>
          <a href="#">Central de suporte</a>
        </div>

        <div class="status-bar">
          <div class="status-online">
            <div class="pulse"></div>
            Sistema online
          </div>
          <span>Conexão segura</span>
        </div>
      </div>
    </section>

  </main>
  `;
}

export function init() {
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("loginError");

  const ROLE_DESTINO = { admin: "home", rh: "home", operador: "home" };

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  }

  function hideError() {
    errorBox.style.display = "none";
  }

  // Enter no campo senha dispara login
  document.getElementById("senha").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });

  loginBtn.addEventListener("click", async () => {
    hideError();
    const matricula = document.getElementById("matricula").value.trim();
    const senha     = document.getElementById("senha").value;

    if (!matricula || !senha) {
      showError("Informe matrícula e senha.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Entrando...";

    try {
      await RibasAPI.Auth.login(matricula, senha);
      const user = RibasAPI.session.getUser();
      const primeiroLogin = localStorage.getItem("primeiroLogin") === "1";

      if (primeiroLogin) {
        window.location.hash = "profile";
      } else {
        window.location.hash = ROLE_DESTINO[user?.role] || "home";
      }
    } catch (err) {
      showError(err.message || "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Entrar no sistema";
    }
  });
}
