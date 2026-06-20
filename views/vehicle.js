/**
 * views/vehicle.js — Ficha do veículo
 *
 * Acessível para qualquer role logado.
 * Admin pode editar, desativar e gerenciar documentos.
 * RH e Operador visualizam apenas.
 *
 * URL: #vehicle?id=<mongoId>
 */

export function template() {
  return `
  <main class="admin-body">
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <div class="mini-badge green" id="formBadge">Ficha do Veículo</div>
          <h1 class="dashboard-title" id="formTitle">Carregando...</h1>
        </div>
        <div class="header-actions">
          <button class="new-btn" id="editBtn" style="display:none; background:#f0ad4e; font-size:20px; height:60px; padding:0 24px;">✏️ Editar</button>
          <button class="new-btn" id="btnVoltar" style="background:#555; font-size:20px; height:60px; padding:0 24px;">← Voltar</button>
          <button class="logout-btn" id="logoutBtn">Sair</button>
        </div>
      </header>

      <!-- Banner somente leitura -->
      <div id="readonlyBanner" style="display:none; align-items:center; gap:8px; background:#fff3cd; border:1px solid #ffc107; border-left:4px solid #e6a800; border-radius:8px; padding:14px 18px; margin-bottom:20px; font-size:0.95rem; color:#856404;">
        🔒 Você está visualizando os dados deste veículo. Somente administradores podem editar.
      </div>

      <!-- Dados do veículo -->
      <section class="form-panel" style="margin-bottom:20px;">
        <div class="panel-top">
          <div>
            <div class="mini-badge green">Ficha Técnica</div>
            <h2 class="panel-title">Dados do Equipamento</h2>
          </div>
          <div class="status-pill" id="veiculoIdBadge"></div>
        </div>

        <div class="form-grid" style="margin-top:15px;">
          <div class="form-group"><label>Modelo / Equipamento</label><input type="text" id="modelo" placeholder="Ex: Liebherr LTM 1050"></div>
          <div class="form-group">
            <label>Categoria</label>
            <select id="categoria">
              <option value="GUINDASTE">Guindaste</option>
              <option value="CAMINHAO">Caminhão</option>
              <option value="MUNCK">Munck</option>
              <option value="EMPILHADEIRA">Empilhadeira</option>
            </select>
          </div>
          <div class="form-group"><label>Placa / Identificação</label><input type="text" id="placa"></div>
          <div class="form-group"><label>Ano de Fabricação</label><input type="number" id="ano" min="1980" max="2099"></div>
          <div class="form-group"><label>Capacidade (ton)</label><input type="number" id="capacidade"></div>
          <div class="form-group"><label>Vencimento Documentação</label><input type="date" id="vencimentoDoc"></div>
          <div class="form-group">
            <label>Status Operacional</label>
            <select id="status">
              <option>Liberado</option><option>Bloqueado</option><option>Em Manutenção</option>
            </select>
          </div>
          <div class="form-group"><label>Observações</label><input type="text" id="obs"></div>
        </div>

        <!-- Ações admin (edição) -->
        <div id="adminActions" style="display:none; gap:10px; justify-content:flex-end; margin-top:20px;" class="actions">
          <button class="save-btn" id="saveVehicle">Salvar Alterações</button>
        </div>

        <!-- Zona de desativar -->
        <div id="deleteSection" style="display:none; margin-top:16px; padding:16px; background:#fff5f5; border:1px solid #f5c6cb; border-radius:8px;">
          <p style="color:#721c24; font-size:0.9rem; margin-bottom:12px;">⚠️ O veículo será desativado. O histórico é mantido.</p>
          <button class="save-btn" id="deleteVehicle" style="background:#c0392b;">Desativar Veículo</button>
        </div>

        <div id="formMsg" style="display:none; margin-top:12px; padding:10px 14px; border-radius:8px; font-size:0.9rem;"></div>
      </section>

      <!-- Documentos (só admin) -->
      <section class="form-panel" id="uploadSection" style="display:none; margin-bottom:20px;">
        <div class="panel-top">
          <div>
            <div class="mini-badge" style="color:#007F5F;">Documentação</div>
            <h2 class="panel-title">Documentos do Veículo</h2>
          </div>
        </div>

        <div class="form-grid" style="margin-top:16px; margin-bottom:16px;">
          <div class="form-group">
            <label>Tipo de Documento</label>
            <select id="tipoDoc">
              <option>CRLV / Licenciamento Anual</option>
              <option>Laudo de Inspeção (ART)</option>
              <option>Seguro Obrigatório / RCTR-C</option>
              <option>Certificado de Calibração</option>
              <option>Relatório de Manutenção</option>
              <option>Outros</option>
            </select>
          </div>
          <div class="form-group">
            <label>Link do Documento</label>
            <input type="url" id="documentoUrl" placeholder="https://drive.google.com/...">
          </div>
        </div>

        <p style="color:#888; font-size:0.85rem; margin-bottom:12px;">
          Cole o link do documento (Google Drive, OneDrive etc.).
        </p>

        <div style="text-align:right;">
          <button class="save-btn" id="btnUpload" style="background:#007F5F;">Anexar Documento</button>
        </div>

        <hr style="border:none; border-top:1px solid #e0e0e0; margin:24px 0;">

        <h3 style="font-size:1rem; font-weight:600; margin-bottom:8px;">Documentos Anexados</h3>
        <div id="docList">
          <p id="emptyDocs" style="color:#aaa; font-size:0.9rem;">Nenhum documento anexado ainda.</p>
        </div>
      </section>

      <!-- QR Code -->
      <section class="form-panel" id="qrSection" style="display:none;">
        <div class="panel-top">
          <div>
            <div class="mini-badge" style="color:#0275d8;">QR Code</div>
            <h2 class="panel-title">Acesso Rápido</h2>
          </div>
          <button class="save-btn" id="btnDownloadQR" style="background:#0275d8;">⬇ Baixar QR</button>
        </div>
        <div style="margin-top:20px; display:flex; align-items:flex-start; gap:24px; flex-wrap:wrap;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:12px; padding:20px; background:white; border-radius:10px; border:1px solid #ddd; width:fit-content;">
            <div id="qrCanvas"></div>
            <p style="font-size:0.8rem; color:#666; text-align:center; max-width:160px;">Aponte a câmera para acessar a ficha</p>
          </div>
          <div style="flex:1; min-width:200px;">
            <p style="font-size:0.9rem; color:#555; line-height:1.6;">
              O QR Code direciona para a ficha do veículo em modo de <strong>visualização</strong>.<br><br>
              Qualquer usuário logado pode escanear e consultar os dados.
            </p>
            <p id="qrLinkText" style="margin-top:12px; font-size:0.8rem; color:#888; word-break:break-all;"></p>
          </div>
        </div>
      </section>
    </div>
  </main>
  `;
}

export async function init() {
  const params   = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const veiculoId = params.get("id");
  const user     = RibasAPI.session.getUser();
  const isAdmin  = user?.role === "admin";

  let editMode = false;
  let currentVeiculo = null;
  let currentDocumentos = [];

  const fields = ["modelo", "categoria", "placa", "ano", "capacidade", "vencimentoDoc", "status", "obs"];

  document.getElementById("btnVoltar").addEventListener("click", () => { window.location.hash = "home"; });
  document.getElementById("logoutBtn").addEventListener("click", () => { RibasAPI.Auth.logout(); window.location.hash = "login"; });

  // ── Carregar veículo ─────────────────────────────────────────────────────
  if (!veiculoId) {
    document.getElementById("formTitle").textContent = "Veículo não encontrado";
    return;
  }

  try {
    currentVeiculo = await RibasAPI.Veiculos.getById(veiculoId);
  } catch (err) {
    showMsg("Veículo não encontrado: " + err.message, "err");
    return;
  }

  const v = currentVeiculo;
  document.getElementById("formTitle").textContent      = v.modelo;
  document.getElementById("veiculoIdBadge").textContent = `ID: ${veiculoId}`;

  setVal("modelo",       v.modelo         || "");
  setVal("categoria",    v.categoria      || "GUINDASTE");
  setVal("placa",        v.placa          || "");
  setVal("ano",          v.ano            || "");
  setVal("capacidade",   v.capacidade     ?? "");
  setVal("vencimentoDoc",toDateInput(v.ultimaInspecao));
  setVal("status",       v.status         || "Liberado");
  setVal("obs",          v.obs            || "");

  applyPermissions();
  renderQR();
  await loadDocumentos();

  // ── Permissões ───────────────────────────────────────────────────────────
  function applyPermissions() {
    setDisabled(!editMode);

    if (isAdmin) {
      document.getElementById("editBtn").style.display        = !editMode ? "inline-flex" : "none";
      document.getElementById("adminActions").style.display   = editMode  ? "flex"        : "none";
      document.getElementById("deleteSection").style.display  = editMode  ? "block"       : "none";
      document.getElementById("uploadSection").style.display  = "block";
      document.getElementById("readonlyBanner").style.display = "none";
    } else {
      document.getElementById("editBtn").style.display        = "none";
      document.getElementById("adminActions").style.display   = "none";
      document.getElementById("deleteSection").style.display  = "none";
      document.getElementById("uploadSection").style.display  = "none";
      document.getElementById("readonlyBanner").style.display = "flex";
    }
  }

  function setDisabled(disabled) {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }

  // ── Editar ───────────────────────────────────────────────────────────────
  document.getElementById("editBtn").addEventListener("click", () => {
    editMode = true;
    applyPermissions();
  });

  // ── Salvar ───────────────────────────────────────────────────────────────
  document.getElementById("saveVehicle")?.addEventListener("click", async () => {
    const modelo = getVal("modelo").trim();
    const placa  = getVal("placa").trim();

    if (!modelo || !placa) {
      showMsg("Preencha pelo menos Modelo e Placa.", "warn");
      return;
    }

    const data = {
      modelo,
      categoria:      getVal("categoria"),
      placa,
      capacidade:     getVal("capacidade") ? Number(getVal("capacidade")) : undefined,
      status:         getVal("status"),
      ultimaInspecao: getVal("vencimentoDoc") || undefined,
    };

    const btn = document.getElementById("saveVehicle");
    btn.disabled = true;

    try {
      await RibasAPI.Veiculos.update(veiculoId, data);
      showMsg("✅ Veículo atualizado!", "ok");
      editMode = false;
      applyPermissions();
    } catch (err) {
      showMsg("Não foi possível salvar: " + err.message, "err");
    } finally {
      btn.disabled = false;
    }
  });

  // ── Desativar ────────────────────────────────────────────────────────────
  document.getElementById("deleteVehicle")?.addEventListener("click", async () => {
    if (!confirm(`Desativar permanentemente "${currentVeiculo?.modelo}"?`)) return;
    try {
      await RibasAPI.Veiculos.remove(veiculoId);
      showMsg("Veículo desativado.", "ok");
      setTimeout(() => { window.location.hash = "home"; }, 1200);
    } catch (err) {
      showMsg("Não foi possível desativar: " + err.message, "err");
    }
  });

  // ── QR Code ──────────────────────────────────────────────────────────────
  function renderQR() {
    const qrSection = document.getElementById("qrSection");
    qrSection.style.display = "block";

    const qrUrl = `${window.location.origin}${window.location.pathname}#vehicle?id=${veiculoId}`;
    document.getElementById("qrLinkText").textContent = qrUrl;

    const container = document.getElementById("qrCanvas");
    container.innerHTML = "";

    // qrcode-generator: API estável, gera matriz de módulos e desenha no canvas
    try {
      const qr = qrcode(0, "M");
      qr.addData(qrUrl);
      qr.make();

      const size    = 160;
      const modules = qr.getModuleCount();
      const cell    = Math.floor(size / modules);
      const offset  = Math.floor((size - cell * modules) / 2);

      const canvasEl = document.createElement("canvas");
      canvasEl.width  = size;
      canvasEl.height = size;
      container.appendChild(canvasEl);

      const ctx = canvasEl.getContext("2d");

      // Fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Módulos
      ctx.fillStyle = "#1a1a2e";
      for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              offset + col * cell,
              offset + row * cell,
              cell,
              cell
            );
          }
        }
      }

      document.getElementById("btnDownloadQR").onclick = () => {
        const link = document.createElement("a");
        link.download = `qr_${currentVeiculo?.placa || "veiculo"}.png`;
        link.href = canvasEl.toDataURL("image/png");
        link.click();
      };

    } catch (err) {
      console.error("QR Code erro:", err);
      container.innerHTML = `<p style="color:#c0392b; font-size:0.85rem;">Não foi possível gerar o QR Code.</p>`;
    }
  }

  // ── Documentos ───────────────────────────────────────────────────────────
  async function loadDocumentos() {
    if (!isAdmin) return;
    try {
      const todos = await RibasAPI.DocumentosVeiculo.list();
      currentDocumentos = todos.filter(d => {
        const vid = d.veiculoId?._id || d.veiculoId;
        return vid === veiculoId;
      });
    } catch {
      currentDocumentos = [];
    }
    renderDocs();
  }

  function renderDocs() {
    const list    = document.getElementById("docList");
    const emptyEl = document.getElementById("emptyDocs");

    Array.from(list.querySelectorAll(".doc-item")).forEach(el => el.remove());

    if (!currentDocumentos.length) {
      emptyEl.style.display = "block";
      return;
    }

    emptyEl.style.display = "none";
    currentDocumentos.forEach(doc => {
      const item = document.createElement("div");
      item.className = "doc-item";
      item.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:#f4f4f4; border-radius:8px; padding:10px 14px; margin-bottom:8px;";
      const data = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("pt-BR") : "";
      item.innerHTML = `
        <div>
          <span>📄 ${doc.nome}</span>
          <div style="font-size:0.78rem; color:#888; margin-top:2px;">${data}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <a href="${doc.documentoUrl}" target="_blank" rel="noopener" class="save-btn" style="padding:4px 12px; font-size:0.8rem; background:#0275d8; height:auto;">Abrir</a>
          <button style="background:none; border:none; color:#c0392b; cursor:pointer; font-size:1.1rem;" data-id="${doc._id}" class="doc-remove">✕</button>
        </div>`;
      list.appendChild(item);
    });

    list.querySelectorAll(".doc-remove").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          await RibasAPI.DocumentosVeiculo.remove(btn.dataset.id);
          await loadDocumentos();
        } catch (err) {
          showMsg("Não foi possível remover: " + err.message, "err");
        }
      });
    });
  }

  document.getElementById("btnUpload")?.addEventListener("click", async () => {
    const tipo = getVal("tipoDoc");
    const url  = document.getElementById("documentoUrl").value.trim();

    if (!url) { showMsg("Cole o link do documento antes de anexar.", "warn"); return; }

    const btn = document.getElementById("btnUpload");
    btn.disabled = true;
    try {
      await RibasAPI.DocumentosVeiculo.create({ veiculoId, nome: tipo, documentoUrl: url });
      document.getElementById("documentoUrl").value = "";
      await loadDocumentos();
      showMsg("✅ Documento anexado!", "ok");
    } catch (err) {
      showMsg("Não foi possível anexar: " + err.message, "err");
    } finally {
      btn.disabled = false;
    }
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getVal(id) { return document.getElementById(id)?.value || ""; }
function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date) ? "" : date.toISOString().slice(0, 10);
}

function showMsg(text, type) {
  const el = document.getElementById("formMsg");
  if (!el) return;
  el.textContent   = text;
  el.style.display = "block";
  el.style.background = type === "ok" ? "#d8f0e7" : type === "warn" ? "#fff3cd" : "#f7dde0";
  el.style.color      = type === "ok" ? "#007F5F" : type === "warn" ? "#856404" : "#c62828";
}
