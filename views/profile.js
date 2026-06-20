/**
 * views/profile.js — Perfil unificado para todos os roles
 *
 * Mostra dados do usuário logado + formulário de troca de senha.
 * Admin vê apenas nome/matrícula (não tem documento User no backend).
 * RH e Operador buscam dados completos via GET /users/:id.
 */

export function template() {
  const user = RibasAPI.session.getUser();
  const roleLabel = { admin: "Administrador", rh: "RH / Gestor", operador: "Operador" }[user?.role] || "Usuário";

  return `
  <main class="admin-body">
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <div class="mini-badge">Configurações de Conta</div>
          <h1 class="dashboard-title">Meu Perfil</h1>
        </div>
        <div class="header-actions">
          <button class="new-btn" id="btnVoltar" style="background:#555; font-size:20px; height:60px; padding:0 24px;">← Voltar</button>
          <button class="logout-btn" id="logoutBtn">Sair</button>
        </div>
      </header>

      <!-- Banner primeiro login -->
      <div class="first-login-banner" id="firstLoginBanner">
        🔐 <span><strong>Primeiro acesso detectado!</strong> Por segurança, altere sua senha padrão antes de continuar.</span>
      </div>

      <!-- Dados pessoais -->
      <section class="form-panel" style="margin-bottom:20px;">
        <div class="panel-top">
          <div>
            <div class="mini-badge">Informações Pessoais</div>
            <h2 class="panel-title">Dados do Profissional</h2>
          </div>
          <div class="status-pill">${roleLabel}</div>
        </div>

        <div class="form-grid" id="dadosPessoais" style="margin-top:15px;">
          <!-- preenchido por init() -->
          <div style="grid-column:1/-1; color:#888; padding:20px 0;">Carregando dados...</div>
        </div>
      </section>

      <!-- Alterar senha -->
      <section class="form-panel">
        <div class="panel-top">
          <div>
            <div class="mini-badge green">Segurança</div>
            <h2 class="panel-title">Alterar Senha</h2>
          </div>
        </div>

        <div class="form-grid" style="margin-top:15px;">
          <div class="form-group">
            <label style="color:#f0ad4e;">Nova Senha</label>
            <input type="password" id="novaSenha" placeholder="Digite a nova senha">
          </div>
          <div class="form-group">
            <label style="color:#f0ad4e;">Confirmar Nova Senha</label>
            <input type="password" id="confirmaSenha" placeholder="Repita a nova senha">
          </div>
        </div>

        <div id="senhaMsg" style="display:none; margin-top:12px; padding:10px 14px; border-radius:8px; font-size:0.9rem;"></div>

        <div class="actions" style="justify-content:flex-end; margin-top:20px;">
          <button class="save-btn" id="btnSalvarSenha">Atualizar Senha</button>
        </div>
      </section>
    </div>
  </main>
  `;
}

export async function init() {
  const user = RibasAPI.session.getUser();

  // Banner de primeiro login
  const isFirstLogin = sessionStorage.getItem("firstLogin") === "1";
  if (isFirstLogin) {
    sessionStorage.removeItem("firstLogin");
    const banner = document.getElementById("firstLoginBanner");
    banner.style.display = "flex";
    setTimeout(() => document.getElementById("novaSenha")?.focus(), 400);
  }

  // Botão voltar
  document.getElementById("btnVoltar").addEventListener("click", () => {
    window.location.hash = "home";
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    RibasAPI.Auth.logout();
    window.location.hash = "login";
  });

  // Preenche dados pessoais
  const container = document.getElementById("dadosPessoais");

  if (user?.role === "admin") {
    // Admin não tem documento User no backend
    container.innerHTML = fieldRow([
      field("Nome", user.nome || "-"),
      field("Matrícula / ID", user.matricula || "-"),
      field("Nível de Acesso", "Administrador Master"),
    ]);
  } else {
    try {
      const perfil = await RibasAPI.Users.getById(user.id);
      container.innerHTML = fieldRow([
        field("Nome Completo",       perfil.nome               || "-"),
        field("Matrícula",           perfil.matricula          || "-"),
        field("Cargo / Função",      perfil.cargo              || "-"),
        field("Telefone",            perfil.telefone           || "-"),
        field("Categoria CNH",       perfil.cnh ? `Categoria ${perfil.cnh}` : "-"),
        field("Validade CNH",        formatDate(perfil.validadeCNH)),
        field("ASO",                 perfil.aso ? "Em dia" : "Pendente"),
        field("Treinamento",         perfil.treinamento ? "Concluído" : "Pendente"),
        field("Validade Treinamento",formatDate(perfil.validadeTreinamento)),
        field("Status",              perfil.status || "-"),
      ]);
    } catch {
      container.innerHTML = fieldRow([
        field("Nome",      user.nome      || "-"),
        field("Matrícula", user.matricula || "-"),
      ]);
    }
  }

  // Salvar senha
  document.getElementById("btnSalvarSenha").addEventListener("click", async () => {
    const nova     = document.getElementById("novaSenha").value;
    const confirma = document.getElementById("confirmaSenha").value;
    const msg      = document.getElementById("senhaMsg");

    if (!nova || !confirma) return showMsg(msg, "Preencha os dois campos de senha.", "warn");
    if (nova.length < 6)    return showMsg(msg, "A senha deve ter pelo menos 6 caracteres.", "warn");
    if (nova !== confirma)  return showMsg(msg, "As senhas não coincidem.", "warn");

    try {
      await RibasAPI.Auth.changePassword(nova);
      RibasAPI.session.setFirstLoginDone();
      document.getElementById("firstLoginBanner").style.display = "none";
      document.getElementById("novaSenha").value    = "";
      document.getElementById("confirmaSenha").value = "";
      showMsg(msg, "✅ Senha atualizada com sucesso!", "ok");
    } catch (err) {
      showMsg(msg, "Não foi possível atualizar a senha: " + err.message, "err");
    }
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function field(label, value) {
  return `
    <div class="form-group">
      <label>${label}</label>
      <input type="text" value="${escapeHtml(String(value))}" disabled>
    </div>`;
}

function fieldRow(fields) {
  return fields.join("");
}

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date)) return String(d);
  return date.toLocaleDateString("pt-BR");
}

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.style.display = "block";
  el.style.background = type === "ok" ? "#d8f0e7" : type === "warn" ? "#fff3cd" : "#f7dde0";
  el.style.color      = type === "ok" ? "#007F5F" : type === "warn" ? "#856404" : "#c62828";
}
