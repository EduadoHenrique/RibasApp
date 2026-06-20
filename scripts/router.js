/**
 * router.js — SPA Router do RibasApp
 *
 * Controla qual view renderizar com base no hash da URL.
 * Ex: index.html#home → renderiza views/home.js
 *
 * Guard de autenticação:
 *   - Sem token → redireciona para #login
 *   - Token expirado → limpa sessão e redireciona para #login
 *   - Role insuficiente → redireciona para #not-authorized
 */

const ROUTES = {
  "login":              { view: "login",             public: true  },
  "home":               { view: "home",              roles: ["admin", "rh", "operador"] },
  "profile":            { view: "profile",           roles: ["admin", "rh", "operador"] },
  "new-user":           { view: "new-user",          roles: ["admin", "rh"] },
  "new-vehicle":        { view: "new-vehicle",       roles: ["admin"] },
  "vehicle":            { view: "vehicle",           roles: ["admin", "rh", "operador"] },
  "not-authorized":     { view: "not-authorized",    public: true  },
};

const app = document.getElementById("app");

function getHash() {
  // Remove o # e ignora query params para lookup da rota
  // Ex: "#vehicle?id=abc123" → "vehicle"
  const full = window.location.hash.replace("#", "") || "login";
  return full.split("?")[0];
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

async function navigate(hash) {
  const route = ROUTES[hash] || ROUTES["not-authorized"];

  const token = localStorage.getItem("token");
  const user  = RibasAPI.session.getUser();

  // Guard: página protegida sem sessão
  if (!route.public) {
    if (!token || !user || isTokenExpired(token)) {
      RibasAPI.session.clear();
      window.location.hash = "login";
      return;
    }
    // Guard: role insuficiente
    if (route.roles && !route.roles.includes(user.role)) {
      window.location.hash = "not-authorized";
      return;
    }
  }

  // Guard: usuário logado tentando acessar login
  if (hash === "login" && token && user && !isTokenExpired(token)) {
    const ROLE_HOME = { admin: "home", rh: "home", operador: "home" };
    window.location.hash = ROLE_HOME[user.role] || "home";
    return;
  }

  // Carrega a view dinamicamente
  try {
    const mod = await import(`../views/${route.view}.js`);
    app.innerHTML = mod.template();
    if (mod.init) mod.init();
  } catch (err) {
    app.innerHTML = `<div style="padding:40px; color:#c0392b;">
      <h2>Erro ao carregar a página</h2>
      <p>${err.message}</p>
    </div>`;
    console.error(err);
  }
}

// Escuta mudanças de hash
window.addEventListener("hashchange", () => navigate(getHash()));

// Carrega a view inicial
navigate(getHash());

// Função global para navegar programaticamente
window.goto = (hash) => { window.location.hash = hash; };
