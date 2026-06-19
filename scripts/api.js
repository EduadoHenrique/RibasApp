/**
 * api.js — Camada de integração com o backend (RibasApp-Backend)
 *
 * Backend hospedado no Render: https://ribasapp-backend.onrender.com
 * Repositório: https://github.com/Janeckiisa/RibasApp-Backend
 *
 * Inclua este script ANTES de qualquer outro script que faça chamadas à API.
 * Ele expõe o objeto global `RibasAPI` com métodos para cada recurso.
 */

(function () {
  const API_BASE_URL = "https://ribasapp-backend.onrender.com";

  // ── Sessão (token JWT + usuário logado) ───────────────────────────────────
  function getToken() {
    return localStorage.getItem("token");
  }

  function getUsuario() {
    try { return JSON.parse(localStorage.getItem("usuario")); }
    catch { return null; }
  }

  function setSession({ token, usuario, primeiroLogin }) {
    if (token) localStorage.setItem("token", token);
    if (usuario) localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("primeiroLogin", primeiroLogin ? "1" : "0");
  }

  function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("primeiroLogin");
  }

  function isFirstLogin() {
    return localStorage.getItem("primeiroLogin") === "1";
  }

  function setFirstLoginDone() {
    localStorage.setItem("primeiroLogin", "0");
  }

  // ── Função genérica de requisição ───────────────────────────────────────
  async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = "Bearer " + token;
    }

    let response;
    try {
      response = await fetch(API_BASE_URL + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined
      });
    } catch (networkError) {
      // Erro de rede (sem conexão, CORS bloqueado, servidor em "cold start" do Render etc.)
      throw new Error(
        "Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em alguns segundos (o servidor pode estar iniciando)."
      );
    }

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const message = (data && (data.error || data.message)) || "Erro inesperado (HTTP " + response.status + ")";
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // ── Autenticação ───────────────────────────────────────────────────────
  const Auth = {
    async login(matricula, senha) {
      const data = await request("/auth/login", {
        method: "POST",
        auth: false,
        body: { matricula, senha }
      });
      setSession({
        token: data.token,
        usuario: data.usuario,
        primeiroLogin: data.primeiroLogin
      });
      return data;
    },

    async changePassword(novaSenha) {
      return request("/auth/change-password", {
        method: "PUT",
        body: { novaSenha }
      });
    },

    logout() {
      clearSession();
    }
  };

  // ── Usuários (operadores, RH, admins cadastrados como User) ──────────────
  const Users = {
    list() {
      return request("/users");
    },
    getById(id) {
      return request(`/users/${id}`);
    },
    create(payload) {
      return request("/users", { method: "POST", body: payload });
    },
    update(id, payload) {
      return request(`/users/${id}`, { method: "PUT", body: payload });
    },
    remove(id) {
      return request(`/users/${id}`, { method: "DELETE" });
    }
  };

  // ── Veículos ───────────────────────────────────────────────────────────
  const Veiculos = {
    list() {
      return request("/veiculos");
    },
    getById(id) {
      return request(`/veiculos/${id}`);
    },
    create(payload) {
      return request("/veiculos", { method: "POST", body: payload });
    },
    update(id, payload) {
      return request(`/veiculos/${id}`, { method: "PUT", body: payload });
    },
    remove(id) {
      return request(`/veiculos/${id}`, { method: "DELETE" });
    }
  };

  // ── Documentos de veículo ─────────────────────────────────────────────
  const DocumentosVeiculo = {
    list() {
      return request("/documentos-veiculo");
    },
    getById(id) {
      return request(`/documentos-veiculo/${id}`);
    },
    create(payload) {
      return request("/documentos-veiculo", { method: "POST", body: payload });
    },
    update(id, payload) {
      return request(`/documentos-veiculo/${id}`, { method: "PUT", body: payload });
    },
    remove(id) {
      return request(`/documentos-veiculo/${id}`, { method: "DELETE" });
    }
  };

  window.RibasAPI = {
    baseUrl: API_BASE_URL,
    session: { getToken, getUsuario, setSession, clearSession, isFirstLogin, setFirstLoginDone },
    Auth,
    Users,
    Veiculos,
    DocumentosVeiculo
  };
})();
