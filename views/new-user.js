/**
 * views/new-user.js — Cadastro / edição de operador
 *
 * URL com ?id=<mongoId> → modo edição
 * URL sem ?id           → modo criação
 */

export function template() {
  return `
  <main class="admin-body">
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <div class="mini-badge green" id="formBadge">Cadastro RH</div>
          <h1 class="dashboard-title" id="formTitle">Novo Operador</h1>
        </div>
        <div class="header-actions">
          <button class="new-btn" id="btnVoltar" style="background:#555; font-size:20px; height:60px; padding:0 24px;">← Voltar</button>
          <button class="logout-btn" id="logoutBtn">Sair</button>
        </div>
      </header>

      <section class="form-panel">
        <div class="panel-top">
          <div>
            <div class="mini-badge green">Formulário</div>
            <h2 class="panel-title">Dados do Profissional</h2>
          </div>
          <div class="status-pill" id="userIdBadge" style="font-family:monospace; font-size:0.85rem;">ID: Novo</div>
        </div>

        <div class="form-grid">
          <div class="form-group"><label>Nome</label><input type="text" id="nome" placeholder="Nome completo do operador"></div>
          <div class="form-group"><label>Matrícula</label><input type="text" id="matricula" placeholder="Ex: OP-2026-01"></div>
          <div class="form-group"><label>Função / Cargo</label><input type="text" id="funcao" placeholder="Ex: Operador de Guindaste"></div>
          <div class="form-group"><label>Telefone</label><input type="text" id="telefone" placeholder="(00) 00000-0000"></div>
          <div class="form-group">
            <label>CNH</label>
            <select id="cnh">
              <option>A</option><option>B</option><option>C</option><option>D</option><option>E</option>
            </select>
          </div>
          <div class="form-group"><label>Validade CNH</label><input type="date" id="validadeCnh"></div>
          <div class="form-group" style="display:flex; align-items:center; gap:12px; padding-top:36px;">
            <input type="checkbox" id="aso" style="width:20px; height:20px; cursor:pointer;">
            <label for="aso" style="margin:0; cursor:pointer;">ASO em dia</label>
          </div>
          <div class="form-group" style="display:flex; align-items:center; gap:12px; padding-top:36px;">
            <input type="checkbox" id="treinamento" style="width:20px; height:20px; cursor:pointer;">
            <label for="treinamento" style="margin:0; cursor:pointer;">Treinamento concluído</label>
          </div>
          <div class="form-group"><label>Validade Treinamento</label><input type="date" id="validadeTreinamento"></div>
          <div class="form-group">
            <label>Status</label>
            <select id="status">
              <option>Ativo</option><option>Bloqueado</option><option>Férias</option>
            </select>
          </div>
          <div class="form-group" id="tipoUsuarioGroup">
            <label>Nível de Acesso</label>
            <select id="tipoUsuario">
              <option value="OPERADOR">Operador</option>
              <option value="GESTOR">RH / Gestor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>

        <p id="tipoUsuarioAviso" style="display:none; color:#555; background:#f0f0f0; border:1px solid #ccc; border-radius:8px; padding:12px 16px; font-size:0.9rem; margin-top:16px;">
          ℹ️ Alterar o nível de acesso tem efeito imediato. O usuário precisará fazer login novamente para as novas permissões serem aplicadas.
        </p>

        <div id="deleteSection" style="display:none; margin-top:16px; padding:16px; background:#fff5f5; border:1px solid #f5c6cb; border-radius:8px;">
          <p style="color:#721c24; font-size:0.9rem; margin-bottom:12px;">⚠️ Esta ação desativa o operador permanentemente. O histórico é mantido.</p>
          <button class="save-btn" id="deleteOperator" style="background:#c0392b;">Desativar Operador</button>
        </div>

        <div id="formMsg" style="display:none; margin-top:12px; padding:10px 14px; border-radius:8px; font-size:0.9rem;"></div>

        <div class="actions" style="justify-content:flex-end; margin-top:24px;">
          <button class="save-btn" id="saveOperator">Salvar Operador</button>
        </div>
      </section>
    </div>
  </main>
  `;
}

export async function init() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const userId = params.get("id");
  const isEdit = !!userId;

  document.getElementById("btnVoltar").addEventListener("click", () => { window.location.hash = "home"; });
  document.getElementById("logoutBtn").addEventListener("click", () => { RibasAPI.Auth.logout(); window.location.hash = "login"; });

  if (isEdit) {
    document.getElementById("formTitle").textContent = "Editar Operador";
    document.getElementById("formBadge").textContent = "Edição RH";
    document.getElementById("userIdBadge").textContent = `ID: ${userId}`;
    document.getElementById("tipoUsuarioGroup").style.display = "block";
    document.getElementById("tipoUsuarioAviso").style.display = "block";
    document.getElementById("deleteSection").style.display = "block";

    try {
      const op = await RibasAPI.Users.getById(userId);
      val("nome", op.nome || "");
      val("matricula", op.matricula || "");
      val("funcao", op.cargo || "");
      val("telefone", op.telefone || "");
      val("cnh", op.cnh || "A");
      val("validadeCnh", toDateInput(op.validadeCNH));
      document.getElementById("aso").checked = !!op.aso;
      document.getElementById("treinamento").checked = !!op.treinamento;
      val("validadeTreinamento", toDateInput(op.validadeTreinamento));
      val("status", op.status || "Ativo");

      // Busca a role atual do UserLogin (GET /users/:id/role)
      try {
        const roleData = await RibasAPI.Users.getRole(userId);
        if (roleData.tipoUsuario) val("tipoUsuario", roleData.tipoUsuario);
      } catch (err) {
        console.error("getRole falhou:", err); // ← adiciona isso
      }

    } catch (err) {
      showMsg("Operador não encontrado: " + err.message, "err");
    }

    document.getElementById("deleteOperator").addEventListener("click", async () => {
      if (!confirm("Deseja desativar permanentemente este operador?")) return;
      try {
        await RibasAPI.Users.remove(userId);
        showMsg("Operador desativado.", "ok");
        setTimeout(() => { window.location.hash = "home"; }, 1200);
      } catch (err) {
        showMsg("Não foi possível desativar: " + err.message, "err");
      }
    });
  }

  document.getElementById("saveOperator").addEventListener("click", async () => {
    // Lê tipoUsuario diretamente do elemento (não via get() para evitar fallback vazio)
    const selectTipo = document.getElementById("tipoUsuario");
    const tipoSelecionado = selectTipo ? selectTipo.value : "OPERADOR";

    console.log("[new-user] isEdit:", isEdit);
    console.log("[new-user] tipoUsuario no select:", tipoSelecionado);

    const data = {
      nome: get("nome"),
      matricula: get("matricula"),
      cargo: get("funcao"),
      telefone: get("telefone"),
      cnh: get("cnh"),
      validadeCNH: get("validadeCnh") || undefined,
      aso: document.getElementById("aso").checked,
      treinamento: document.getElementById("treinamento").checked,
      validadeTreinamento: get("validadeTreinamento") || undefined,
      status: get("status"),
      tipoUsuario: tipoSelecionado,
    };

    console.log("[new-user] data sendo enviado:", JSON.stringify(data));

    if (!data.nome || !data.matricula) {
      showMsg("Preencha Nome e Matrícula.", "warn");
      return;
    }

    const btn = document.getElementById("saveOperator");
    btn.disabled = true;

    try {
      if (isEdit) {
        await RibasAPI.Users.update(userId, data);

        // Atualiza role separadamente (UserLogin é uma coleção diferente)
        const novoTipo = get("tipoUsuario");
        if (novoTipo) {
          await RibasAPI.Users.updateRole(userId, novoTipo);
        }

        showMsg("✅ Operador atualizado com sucesso!", "ok");
        setTimeout(() => { window.location.hash = "home"; }, 1200);
      } else {
        const result = await RibasAPI.Users.create(data);
        showMsg(`✅ Usuário cadastrado! Senha temporária: ${result.senhaTemporaria || "(verifique com o admin)"}`, "ok");
        setTimeout(() => { window.location.hash = "home"; }, 3000);
      }
    } catch (err) {
      showMsg("Não foi possível salvar: " + err.message, "err");
    } finally {
      btn.disabled = false;
    }
  });
}

function get(id) { return document.getElementById(id)?.value || ""; }
function val(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date) ? "" : date.toISOString().slice(0, 10);
}

function showMsg(text, type) {
  const el = document.getElementById("formMsg");
  el.textContent = text;
  el.style.display = "block";
  el.style.background = type === "ok" ? "#d8f0e7" : type === "warn" ? "#fff3cd" : "#f7dde0";
  el.style.color = type === "ok" ? "#007F5F" : type === "warn" ? "#856404" : "#c62828";
}
