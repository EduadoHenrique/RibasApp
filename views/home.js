/**
 * views/home.js — Painel principal (diferente por role)
 *
 * admin   → lista de veículos + botão novo veículo
 * rh      → lista de operadores + botão novo operador
 * operador → meus veículos
 */

export function template() {
  const user = RibasAPI.session.getUser();

  const headerActions = {
    admin: `
      <a href="#profile" class="new-btn" style="background:#555; font-size:20px; height:60px; padding:0 24px; display:flex; align-items:center; text-decoration:none;">Meu Perfil</a>
      <button class="new-btn" id="btnNovoVeiculo" style="font-size:20px; height:60px; padding:0 24px;">+ Novo Veículo</button>
      <button class="logout-btn" id="logoutBtn">Sair</button>`,
    rh: `
      <a href="#profile" class="new-btn" style="background:#555; font-size:20px; height:60px; padding:0 24px; display:flex; align-items:center; text-decoration:none;">Meu Perfil</a>
      <button class="new-btn" id="btnNovoOperador" style="font-size:20px; height:60px; padding:0 24px;">+ Novo Operador</button>
      <button class="logout-btn" id="logoutBtn">Sair</button>`,
    operador: `
      <a href="#profile" class="new-btn" style="background:#555; font-size:20px; height:60px; padding:0 24px; display:flex; align-items:center; text-decoration:none;">Meu Perfil</a>
      <button class="logout-btn" id="logoutBtn">Sair</button>`,
  };

  const titles = {
    admin:    { badge: "Gestão Operacional", title: "Frota Industrial" },
    rh:       { badge: "Recursos Humanos",   title: "Gestão de Operadores" },
    operador: { badge: "Operação Industrial", title: user?.nome ? `Olá, ${user.nome.split(" ")[0]}` : "Painel do Operador" },
  };

  const role = user?.role || "operador";
  const { badge, title } = titles[role] || titles.operador;

  return `
  <main class="admin-body">
    <div class="dashboard">
      <header class="dashboard-header">
        <div>
          <div class="mini-badge">${badge}</div>
          <h1 class="dashboard-title" id="mainTitle">${title}</h1>
        </div>
        <div class="header-actions">${headerActions[role] || headerActions.operador}</div>
      </header>

      <section class="stats-grid" id="statsGrid">
        <!-- preenchido por init() -->
      </section>

      <section class="operator-section">
        <div class="panel-top">
          <div>
            <div class="mini-badge green" id="listBadge"></div>
            <h2 class="panel-title small" id="listTitle"></h2>
          </div>
        </div>
        <div class="operator-grid" id="mainList" style="margin-top:20px;"></div>
      </section>
    </div>
  </main>
  `;
}

export function init() {
  const user = RibasAPI.session.getUser();
  const role = user?.role || "operador";

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    RibasAPI.Auth.logout();
    window.location.hash = "login";
  });

  document.getElementById("btnNovoVeiculo")?.addEventListener("click",   () => { window.location.hash = "new-vehicle"; });
  document.getElementById("btnNovoOperador")?.addEventListener("click",  () => { window.location.hash = "new-user"; });

  if (role === "admin")    renderVehicles();
  else if (role === "rh") renderOperators();
  else                    renderMyVehicles();
}

// ── ADMIN: lista de veículos ────────────────────────────────────────────────

async function renderVehicles() {
  const list = document.getElementById("mainList");
  document.getElementById("listBadge").textContent = "Frota Industrial";
  document.getElementById("listTitle").textContent = "Lista Operacional";

  list.innerHTML = loadingMsg("Carregando frota...");

  let vehicles = [];
  try { vehicles = await RibasAPI.Veiculos.list(); }
  catch (err) { list.innerHTML = errorMsg(err.message); return; }

  let blocked = 0, active = 0, warning = 0;

  vehicles.forEach(v => {
    if (v.status === "Bloqueado") blocked++;
    else if (v.status === "Liberado") active++;
    if (v.ultimaInspecao && calcDays(v.ultimaInspecao) <= 30) warning++;
  });

  document.getElementById("statsGrid").innerHTML = `
    ${statCard("warning", "Documentos vencendo", warning, "Certificações expiram nos próximos 30 dias.")}
    ${statCard("danger",  "Equipamentos bloqueados", blocked, "Veículos impedidos de operar.")}
    ${statCard("success", "Operação ativa", active, "Equipamentos liberados para campo.")}
  `;

  if (vehicles.length === 0) {
    list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
      <p style="font-size:1.1rem;">Nenhum veículo cadastrado ainda.</p>
      <button class="save-btn" onclick="window.location.hash='new-vehicle'" style="margin-top:15px;">+ Cadastrar Primeiro Veículo</button>
    </div>`;
    return;
  }

  list.innerHTML = vehicles.map(v => `
    <div class="operator-card" onclick="window.location.hash='vehicle?id=${v._id}'">
      <div class="operator-top">
        <div>
          <h3>${v.modelo}</h3>
          <p>${categoriaLabel(v.categoria)}</p>
        </div>
        <div class="status ${statusClass(v.status)}">${v.status || "-"}</div>
      </div>
      <div class="operator-info" style="margin-top:10px;">
        <p><strong>Placa:</strong> ${v.placa}</p>
        <p><strong>Capacidade:</strong> ${v.capacidade ?? "-"}</p>
        <p><strong>Responsável:</strong> ${v.operador?.nome || "-"}</p>
      </div>
      ${v.ultimaInspecao && calcDays(v.ultimaInspecao) <= 30 ? `
        <div class="alerts" style="margin-top:10px;">
          <div class="alert warning-alert">Inspeção vencendo em ${calcDays(v.ultimaInspecao)} dias</div>
        </div>` : ""}
    </div>
  `).join("");
}

// ── RH: lista de operadores ─────────────────────────────────────────────────

async function renderOperators() {
  const list = document.getElementById("mainList");
  document.getElementById("listBadge").textContent = "Operadores";
  document.getElementById("listTitle").textContent = "Operadores Cadastrados";

  list.innerHTML = loadingMsg("Carregando operadores...");

  let operators = [];
  try { operators = await RibasAPI.Users.list(); }
  catch (err) { list.innerHTML = errorMsg(err.message); return; }

  let cnhAlert = 0, asoAlert = 0, active = 0;

  operators.forEach(op => {
    if (calcDays(op.validadeCNH) <= 30) cnhAlert++;
    if (!op.aso) asoAlert++;
    if (op.status === "Ativo") active++;
  });

  document.getElementById("statsGrid").innerHTML = `
    ${statCard("warning", "CNHs vencendo",    cnhAlert, "Operadores com CNH próxima do vencimento.")}
    ${statCard("danger",  "ASOs vencidos",    asoAlert, "Operadores impedidos de operar.")}
    ${statCard("success", "Operadores ativos", active,  "Profissionais liberados para operação.")}
  `;

  if (operators.length === 0) {
    list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
      <p style="font-size:1.1rem;">Nenhum operador cadastrado ainda.</p>
      <button class="save-btn" onclick="window.location.hash='new-user'" style="margin-top:15px;">+ Cadastrar Primeiro Operador</button>
    </div>`;
    return;
  }

  list.innerHTML = operators.map(op => {
    const cnhDays = calcDays(op.validadeCNH);
    return `
    <div class="operator-card" onclick="window.location.hash='new-user?id=${op._id}'">
      <div class="operator-top">
        <div>
          <h3>${op.nome}</h3>
          <p>${op.cargo || "-"}</p>
        </div>
        <div class="status ${statusClass(op.status)}">${op.status || "-"}</div>
      </div>
      <div class="operator-info" style="margin-top:10px;">
        <p><strong>Matrícula:</strong> ${op.matricula}</p>
        <p><strong>CNH:</strong> ${op.cnh || "-"}</p>
        <p><strong>Treinamento:</strong> ${op.treinamento ? "Concluído" : "Pendente"}</p>
        <p><strong>Telefone:</strong> ${op.telefone || "-"}</p>
      </div>
      <div class="alerts" style="margin-top:10px;">
        ${cnhDays <= 30 ? `<div class="alert warning-alert">CNH vencendo em ${cnhDays} dias</div>` : ""}
        ${!op.aso      ? `<div class="alert danger-alert">ASO pendente</div>` : ""}
      </div>
    </div>`;
  }).join("");
}

// ── OPERADOR: meus veículos ─────────────────────────────────────────────────

async function renderMyVehicles() {
  const list = document.getElementById("mainList");
  const user = RibasAPI.session.getUser();
  document.getElementById("listBadge").textContent = "Minha Frota";
  document.getElementById("listTitle").textContent = "Meus Equipamentos em Campo";

  list.innerHTML = loadingMsg("Carregando seus veículos...");

  let all = [];
  try { all = await RibasAPI.Veiculos.list(); }
  catch (err) { list.innerHTML = errorMsg(err.message); return; }

  const meus = all.filter(v => {
    const opId = v.operador?._id || v.operador;
    return opId && user?.id && opId === user.id;
  });

  const bloqueados = meus.filter(v => v.status === "Bloqueado").length;
  const vencendo   = meus.filter(v => calcDays(v.ultimaInspecao) <= 30 && calcDays(v.ultimaInspecao) >= 0).length;

  document.getElementById("statsGrid").innerHTML = `
    ${statCard("success", "Meus equipamentos",       meus.length, "Veículos sob minha responsabilidade.")}
    ${statCard("warning", "Documentos vencendo",     vencendo,    "Veículos com documentação próxima do vencimento.")}
    ${statCard("danger",  "Equipamentos bloqueados", bloqueados,  "Operações impedidas no momento.")}
  `;

  if (meus.length === 0) {
    list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
      <p style="font-size:1.1rem;">Nenhum veículo está registrado no seu nome.</p>
      <p style="font-size:0.9rem; margin-top:8px;">Solicite ao Administrador que vincule equipamentos ao seu nome.</p>
    </div>`;
    return;
  }

  list.innerHTML = meus.map(v => {
    const days = calcDays(v.ultimaInspecao);
    return `
    <div class="operator-card" onclick="window.location.hash='vehicle?id=${v._id}'">
      <div class="operator-top">
        <div><h3>${v.modelo}</h3><p>${categoriaLabel(v.categoria)}</p></div>
        <div class="status ${statusClass(v.status)}">${v.status || "-"}</div>
      </div>
      <div class="operator-info" style="margin-top:10px;">
        <p><strong>Placa:</strong> ${v.placa}</p>
        <p><strong>Capacidade:</strong> ${v.capacidade ?? "-"}</p>
      </div>
      ${days !== null && days <= 30 ? `
        <div class="alerts" style="margin-top:10px;">
          <div class="alert ${days < 0 ? "danger-alert" : "warning-alert"}">
            Inspeção ${days < 0 ? "vencida há " + Math.abs(days) : "vencendo em " + days} dias
          </div>
        </div>` : ""}
    </div>`;
  }).join("");
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcDays(dateStr) {
  if (!dateStr) return 999;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function statusClass(s) {
  if (s === "Liberado" || s === "Ativo") return "green-status";
  if (s === "Bloqueado")                 return "red-status";
  return "yellow-status";
}

function categoriaLabel(cat) {
  return { GUINDASTE: "Guindaste", CAMINHAO: "Caminhão", MUNCK: "Munck", EMPILHADEIRA: "Empilhadeira" }[cat] || cat || "-";
}

function statCard(type, label, value, desc) {
  return `
    <div class="stat-card ${type}">
      <span>${label}</span>
      <h2>${String(value).padStart(2, "0")}</h2>
      <p>${desc}</p>
    </div>`;
}

function loadingMsg(msg) {
  return `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">${msg}</div>`;
}

function errorMsg(msg) {
  return `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#c0392b;">
    <p style="font-size:1.1rem;">Não foi possível carregar os dados.</p>
    <p style="font-size:0.9rem; margin-top:8px;">${msg}</p>
  </div>`;
}
