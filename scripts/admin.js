/**
 * admin.js — Painel do Administrador (lista de veículos/frota)
 * Usa RibasAPI.Veiculos (GET /veiculos)
 */

window.onload = () => {
  const newVehicle = document.getElementById("newVehicle");
  const logoutBtn = document.getElementById("logoutBtn");
  const vehicleList = document.getElementById("vehicleList");

  newVehicle.addEventListener("click", () => {
    window.location.href = "./cadastro_veiculo.html?veiculoID=novo";
  });

  logoutBtn.addEventListener("click", () => RibasAuth.logout());

  renderVehicles();

  async function renderVehicles() {
    vehicleList.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Carregando frota...</div>`;

    let vehicles = [];
    try {
      vehicles = await RibasAPI.Veiculos.list();
    } catch (error) {
      vehicleList.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#c0392b;">
          <p style="font-size:1.1rem;">Não foi possível carregar a frota.</p>
          <p style="font-size:0.9rem; margin-top:8px;">${error.message}</p>
        </div>`;
      return;
    }

    vehicleList.innerHTML = "";

    let blocked = 0, active = 0, warning = 0;

    if (vehicles.length === 0) {
      vehicleList.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
          <p style="font-size:1.1rem;">Nenhum veículo cadastrado ainda.</p>
          <button class="save-btn" onclick="window.location.href='cadastro_veiculo.html?veiculoID=novo'" style="margin-top:15px;">+ Cadastrar Primeiro Veículo</button>
        </div>`;
      updateStats(0, 0, 0);
      return;
    }

    vehicles.forEach((v) => {
      if (v.status === "Bloqueado") blocked++;
      else if (v.status === "Liberado") active++;
      if (v.ultimaInspecao) {
        const days = calcDays(v.ultimaInspecao);
        if (days <= 30 && days > 0) warning++;
      }

      vehicleList.innerHTML += `
        <div class="operator-card" style="cursor:pointer;" onclick="window.location.href='cadastro_veiculo.html?veiculoID=${v._id}'">
          <div class="operator-top">
            <div>
              <h3>${v.modelo}</h3>
              <p>${categoriaLabel(v.categoria)}</p>
            </div>
            <div class="status ${statusClass(v.status)}">${v.status || "-"}</div>
          </div>
          <div class="operator-info">
            <p><strong>Placa:</strong> ${v.placa}</p>
            <p><strong>Capacidade:</strong> ${v.capacidade != null ? v.capacidade : "-"}</p>
            <p><strong>Responsável:</strong> ${v.operador?.nome || "-"}</p>
          </div>
          ${v.ultimaInspecao && calcDays(v.ultimaInspecao) <= 30 ? `<div class="alerts"><div class="alert warning-alert">Inspeção vencendo em ${calcDays(v.ultimaInspecao)} dias</div></div>` : ""}
        </div>
      `;
    });

    updateStats(warning, blocked, active);
  }

  function updateStats(w, b, a) {
    document.getElementById("warningCount").innerText = String(w).padStart(2, "0");
    document.getElementById("blockedCount").innerText = String(b).padStart(2, "0");
    document.getElementById("activeCount").innerText = String(a).padStart(2, "0");
  }

  function calcDays(dateStr) {
    if (!dateStr) return 999;
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  }

  function statusClass(s) {
    if (s === "Liberado") return "green-status";
    if (s === "Bloqueado") return "red-status";
    return "yellow-status";
  }

  function categoriaLabel(cat) {
    const map = { GUINDASTE: "Guindaste", CAMINHAO: "Caminhão", MUNCK: "Munck", EMPILHADEIRA: "Empilhadeira" };
    return map[cat] || cat || "-";
  }
};
