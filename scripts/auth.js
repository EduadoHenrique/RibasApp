/**
 * auth.js — Guardião de sessão e permissões
 *
 * Inclua este script (depois de api.js) em TODAS as páginas protegidas,
 * ANTES dos demais scripts, passando data attributes na tag <script>.
 *
 * Uso:
 *   <script src="../scripts/api.js"></script>
 *   <script src="../scripts/auth.js" data-roles="admin,rh"></script>
 *   <script src="../scripts/auth.js" data-roles="admin"></script>
 *   <script src="../scripts/auth.js" data-roles="operador,rh,admin"></script>
 *
 * Se data-roles não for informado, apenas exige que o usuário esteja logado.
 *
 * A sessão (token JWT + dados do usuário) é alimentada pelo app.js no login,
 * via RibasAPI (scripts/api.js), e fica em localStorage: "token" e "usuario".
 */

(function () {
  // Detecta quais roles têm permissão via data attribute
  const scriptEl    = document.currentScript;
  const allowedRaw  = scriptEl ? scriptEl.getAttribute("data-roles") : null;
  const allowedRoles = allowedRaw ? allowedRaw.split(",").map(r => r.trim()) : null;

  // Caminho relativo para raiz (pages/ está 1 nível acima de index.html)
  const isInPages = window.location.pathname.includes("/pages/");
  const rootPath  = isInPages ? "../index.html"     : "index.html";
  const pagesPath = isInPages ? ""                  : "pages/";

  function perfilPage(role) {
    const map = { admin: "perfil_admin.html", rh: "perfil.html", operador: "perfil_operador.html" };
    return pagesPath + (map[role] || "perfil.html");
  }

  function acessoNegadoPage() {
    return pagesPath + "acesso_negado.html";
  }

  // ── 1. Verifica sessão (token + usuário) ──────────────────────────────────
  const token = localStorage.getItem("token");
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("usuario")); }
    catch { return null; }
  })();

  if (!token || !currentUser || !currentUser.role) {
    // Salva a URL que estava tentando acessar para redirecionar depois do login
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.replace(rootPath);
    return;
  }

  // ── 2. Verifica expiração do token (JWT é válido por 1 dia) ───────────────
  function isTokenExpired(t) {
    try {
      const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("primeiroLogin");
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.replace(rootPath);
    return;
  }

  // ── 3. Verifica permissão ────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    window.location.replace(acessoNegadoPage());
    return;
  }

  // ── 4. Detecta primeiro login (flag vinda do backend) ─────────────────────
  const isFirstLogin = localStorage.getItem("primeiroLogin") === "1";
  const isAlreadyOnProfile = window.location.pathname.includes("perfil");

  if (isFirstLogin && !isAlreadyOnProfile) {
    // Sinaliza para a página de perfil exibir o aviso
    sessionStorage.setItem("firstLogin", "1");
    window.location.replace(perfilPage(currentUser.role));
    return;
  }

  // ── 5. Expõe utilitários globais ─────────────────────────────────────────
  window.RibasAuth = {
    user: currentUser,
    token,
    isAdmin:    () => currentUser.role === "admin",
    isRH:       () => currentUser.role === "rh",
    isOperador: () => currentUser.role === "operador",

    logout() {
      RibasAPI.Auth.logout();
      window.location.href = rootPath;
    },

    // Detecta e exibe banner de primeiro login nas páginas de perfil
    checkFirstLoginBanner() {
      if (sessionStorage.getItem("firstLogin") === "1") {
        sessionStorage.removeItem("firstLogin");
        return true;
      }
      return false;
    },

    // Marca senha como alterada (remove flag de primeiro login) via backend
    async markPasswordChanged(newPassword) {
      await RibasAPI.Auth.changePassword(newPassword);
      RibasAPI.session.setFirstLoginDone();
      return currentUser;
    }
  };
})();
