/**
 * app.js — Login do Ribas App
 *
 * Faz a autenticação real contra o backend (POST /auth/login).
 * O papel do usuário (admin/rh/operador) vem do backend, no campo
 * `tipo` decodificado do token JWT (ADMIN, GESTOR, OPERADOR).
 */

const loginBtn   = document.getElementById("loginBtn");
const errorBox   = document.getElementById("loginError");

// Mapeia o tipoUsuario do backend (ADMIN, GESTOR, OPERADOR) para o role usado nas páginas
const TIPO_PARA_ROLE = {
  ADMIN: "admin",
  GESTOR: "rh",
  OPERADOR: "operador"
};

const ROLE_PARA_PAGINA = {
  admin: "pages/admin.html",
  rh: "pages/rh.html",
  operador: "pages/operador.html"
};

function showError(message) {
  if (!errorBox) { alert(message); return; }
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function hideError() {
  if (errorBox) errorBox.style.display = "none";
}

// Decodifica o payload de um JWT (sem validar assinatura — só para ler o "tipo")
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    hideError();

    const matricula = document.getElementById("matricula")?.value.trim();
    const senha      = document.getElementById("senha")?.value;

    if (!matricula || !senha) {
      showError("Informe matrícula e senha.");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Entrando...";

    try {
      const data = await RibasAPI.Auth.login(matricula, senha);

      const payload = decodeJwtPayload(data.token);
      const role = TIPO_PARA_ROLE[payload?.tipo] || "operador";

      // Mantém o role junto do usuário para as páginas/auth.js usarem
      const usuarioComRole = { ...data.usuario, role };
      localStorage.setItem("usuario", JSON.stringify(usuarioComRole));

      const redirect = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");

      window.location.href = redirect && redirect !== window.location.href
        ? redirect
        : ROLE_PARA_PAGINA[role];

    } catch (error) {
      showError(error.message || "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Entrar no sistema";
    }
  });
}
