/**
 * auth.js — Guardião de sessão e permissões
 *
 * Inclua este script em TODAS as páginas protegidas, ANTES dos demais scripts,
 * passando data attributes na tag <script> ou usando o padrão de configuração abaixo.
 *
 * Uso:
 *   <script src="../scripts/auth.js" data-roles="admin,rh"></script>
 *   <script src="../scripts/auth.js" data-roles="admin"></script>
 *   <script src="../scripts/auth.js" data-roles="operador,rh,admin"></script>
 *
 * Se data-roles não for informado, apenas exige que o usuário esteja logado.
 *
 * Senha padrão (primeiro login): "Ribas@2024"
 * Ao detectar senha padrão, redireciona para o perfil correspondente.
 */

(function () {
  const DEFAULT_PASSWORD = "Ribas@2024";

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

  // ── 1. Verifica sessão ────────────────────────────────────────────────────
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("currentUser")); }
    catch { return null; }
  })();

  if (!currentUser || !currentUser.role) {
    // Salva a URL que estava tentando acessar para redirecionar depois do login
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.replace(rootPath);
    return;
  }

  // ── 2. Verifica permissão ────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    window.location.replace(acessoNegadoPage());
    return;
  }

  // ── 3. Detecta primeiro login (senha padrão) ─────────────────────────────
  const isFirstLogin = currentUser.password === DEFAULT_PASSWORD || !currentUser.password;
  const isAlreadyOnProfile = window.location.pathname.includes("perfil");

  if (isFirstLogin && !isAlreadyOnProfile) {
    // Sinaliza para a página de perfil exibir o aviso
    sessionStorage.setItem("firstLogin", "1");
    window.location.replace(perfilPage(currentUser.role));
    return;
  }

  // ── 4. Expõe utilitários globais ─────────────────────────────────────────
  window.RibasAuth = {
    user: currentUser,
    isAdmin:    () => currentUser.role === "admin",
    isRH:       () => currentUser.role === "rh",
    isOperador: () => currentUser.role === "operador",

    logout() {
      localStorage.removeItem("currentUser");
      sessionStorage.removeItem("firstLogin");
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

    // Marca senha como alterada (remove flag de primeiro login)
    markPasswordChanged(newPassword) {
      const u = { ...currentUser, password: newPassword };
      localStorage.setItem("currentUser", JSON.stringify(u));
      return u;
    }
  };
})();
