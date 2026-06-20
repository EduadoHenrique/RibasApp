/**
 * views/new-vehicle.js — Cadastro de novo veículo (somente admin)
 */

export function template() {
  return `
  <main class="admin-body">
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <div class="mini-badge green">Frota Industrial</div>
          <h1 class="dashboard-title">Novo Veículo</h1>
        </div>
        <div class="header-actions">
          <button class="new-btn" id="btnVoltar" style="background:#555; font-size:20px; height:60px; padding:0 24px;">← Voltar</button>
          <button class="logout-btn" id="logoutBtn">Sair</button>
        </div>
      </header>

      <section class="form-panel">
        <div class="panel-top">
          <div>
            <div class="mini-badge green">Ficha Técnica</div>
            <h2 class="panel-title">Dados do Equipamento</h2>
          </div>
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
          <div class="form-group"><label>Placa / Identificação</label><input type="text" id="placa" placeholder="Ex: ABC-1234"></div>
          <div class="form-group"><label>Ano de Fabricação</label><input type="number" id="ano" placeholder="Ex: 2019" min="1980" max="2099"></div>
          <div class="form-group"><label>Capacidade (ton)</label><input type="number" id="capacidade" placeholder="Ex: 50"></div>
          <div class="form-group"><label>Vencimento Documentação</label><input type="date" id="vencimentoDoc"></div>
          <div class="form-group">
            <label>Status Operacional</label>
            <select id="status">
              <option>Liberado</option>
              <option>Bloqueado</option>
              <option>Em Manutenção</option>
            </select>
          </div>
          <div class="form-group"><label>Observações</label><input type="text" id="obs" placeholder="Informações adicionais"></div>
        </div>

        <div id="formMsg" style="display:none; margin-top:12px; padding:10px 14px; border-radius:8px; font-size:0.9rem;"></div>

        <div class="actions" style="justify-content:flex-end; margin-top:24px;">
          <button class="save-btn" id="saveVehicle">Cadastrar Veículo</button>
        </div>
      </section>
    </div>
  </main>
  `;
}

export function init() {
  document.getElementById("btnVoltar").addEventListener("click", () => { window.location.hash = "home"; });
  document.getElementById("logoutBtn").addEventListener("click", () => { RibasAPI.Auth.logout(); window.location.hash = "login"; });

  document.getElementById("saveVehicle").addEventListener("click", async () => {
    const modelo = get("modelo").trim();
    const placa  = get("placa").trim();

    if (!modelo || !placa) {
      showMsg("Preencha pelo menos o Modelo e a Placa.", "warn");
      return;
    }

    const data = {
      modelo,
      categoria:      get("categoria"),
      placa,
      capacidade:     get("capacidade") ? Number(get("capacidade")) : undefined,
      status:         get("status"),
      ultimaInspecao: get("vencimentoDoc") || undefined,
    };

    const btn = document.getElementById("saveVehicle");
    btn.disabled = true;

    try {
      const created = await RibasAPI.Veiculos.create(data);
      showMsg("✅ Veículo cadastrado com sucesso!", "ok");
      setTimeout(() => { window.location.hash = `vehicle?id=${created._id}`; }, 1200);
    } catch (err) {
      showMsg("Não foi possível cadastrar: " + err.message, "err");
    } finally {
      btn.disabled = false;
    }
  });
}

function get(id) { return document.getElementById(id)?.value || ""; }

function showMsg(text, type) {
  const el = document.getElementById("formMsg");
  el.textContent   = text;
  el.style.display = "block";
  el.style.background = type === "ok" ? "#d8f0e7" : type === "warn" ? "#fff3cd" : "#f7dde0";
  el.style.color      = type === "ok" ? "#007F5F" : type === "warn" ? "#856404" : "#c62828";
}
