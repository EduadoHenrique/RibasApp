/**
 * api.js — Cliente HTTP centralizado do RibasApp
 *
 * Expõe o objeto global RibasAPI com todos os módulos:
 *   RibasAPI.Auth        → POST /auth/login, /auth/register, PUT /auth/change-password
 *   RibasAPI.Users       → CRUD /users
 *   RibasAPI.Veiculos    → CRUD /veiculos
 *   RibasAPI.DocumentosVeiculo → CRUD /documentos-veiculo
 *   RibasAPI.session     → helpers de localStorage
 */

const API_URL = "https://ribasapp-backend.onrender.com";

// ── Utilitário interno ──────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body, requiresAuth = true) {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body !== undefined) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${path}`, options);

  // Tenta parsear JSON; se falhar, retorna texto bruto
  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const msg = data?.error || data?.message || `Erro ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── Módulos públicos ────────────────────────────────────────────────────────

const RibasAPI = {

  // ── Sessão local (localStorage) ────────────────────────────────────────
  session: {
    save(token, usuario, primeiroLogin) {
      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("primeiroLogin", primeiroLogin ? "1" : "0");
    },
    clear() {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      localStorage.removeItem("primeiroLogin");
    },
    getUser() {
      try { return JSON.parse(localStorage.getItem("usuario")); }
      catch { return null; }
    },
    setFirstLoginDone() {
      localStorage.setItem("primeiroLogin", "0");
    }
  },

  // ── Autenticação ────────────────────────────────────────────────────────
  Auth: {
    async login(matricula, senha) {
      const data = await request("POST", "/auth/login", { matricula, senha }, false);
      // Salva token e dados de sessão automaticamente
      if (data.token) {
        const payload = (() => {
          try {
            const b64 = data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(b64));
          } catch { return {}; }
        })();

        const TIPO_PARA_ROLE = { ADMIN: "admin", GESTOR: "rh", OPERADOR: "operador" };
        const role = TIPO_PARA_ROLE[payload.tipo] || "operador";
        const usuario = { ...data.usuario, role };

        RibasAPI.session.save(data.token, usuario, data.primeiroLogin);
      }
      return data;
    },

    async register(userId, senha, tipoUsuario) {
      return request("POST", "/auth/register", { userId, senha, tipoUsuario });
    },

    async changePassword(novaSenha) {
      return request("PUT", "/auth/change-password", { novaSenha });
    },

    logout() {
      RibasAPI.session.clear();
    }
  },

  // ── Usuários (operadores) ───────────────────────────────────────────────
  Users: {
    async list() {
      return request("GET", "/users");
    },
    async getById(id) {
      return request("GET", `/users/${id}`);
    },
    async create(data) {
      return request("POST", "/users", data);
    },
    async update(id, data) {
      return request("PUT", `/users/${id}`, data);
    },
    async remove(id) {
      return request("DELETE", `/users/${id}`);
    },
    async getRole(id) {
      return request("GET", `/users/${id}/role`);
    },
    async updateRole(id, tipoUsuario) {
      return request("PUT", `/users/${id}/role`, { tipoUsuario });
    }
  },

  // ── Veículos ────────────────────────────────────────────────────────────
  Veiculos: {
    async list() {
      return request("GET", "/veiculos");
    },
    async getById(id) {
      return request("GET", `/veiculos/${id}`);
    },
    async create(data) {
      return request("POST", "/veiculos", data);
    },
    async update(id, data) {
      return request("PUT", `/veiculos/${id}`, data);
    },
    async remove(id) {
      return request("DELETE", `/veiculos/${id}`);
    }
  },

  // ── Documentos de Veículo ───────────────────────────────────────────────
  DocumentosVeiculo: {
    async list() {
      return request("GET", "/documentos-veiculo");
    },
    async getById(id) {
      return request("GET", `/documentos-veiculo/${id}`);
    },
    async create(data) {
      return request("POST", "/documentos-veiculo", data);
    },
    async update(id, data) {
      return request("PUT", `/documentos-veiculo/${id}`, data);
    },
    async remove(id) {
      return request("DELETE", `/documentos-veiculo/${id}`);
    }
  }

};
