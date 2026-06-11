window.onload = () => {
  const newVehicle = document.getElementById("newVehicle");
  const logoutBtn = document.getElementById("logoutBtn");
  const vehicleList = document.getElementById("vehicleList");

  newVehicle.addEventListener("click", () => {
    window.location.href = "./cadastro_veiculo.html?veiculoID=0";
  });

  logoutBtn.addEventListener("click", () => RibasAuth.logout());

  renderVehicles();

  function renderVehicles() {
    const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    vehicleList.innerHTML = "";

    let blocked = 0, active = 0, warning = 0;

    if (vehicles.length === 0) {
      vehicleList.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
          <p style="font-size:1.1rem;">Nenhum veículo cadastrado ainda.</p>
          <button class="save-btn" onclick="window.location.href='cadastro_veiculo.html?veiculoID=0'" style="margin-top:15px;">+ Cadastrar Primeiro Veículo</button>
        </div>`;
      updateStats(0, 0, 0);
      return;
    }

    vehicles.forEach((v, index) => {
      if (v.status === "Bloqueado") blocked++;
      else if (v.status === "Liberado") active++;
      if (v.vencimentoDoc) {
        const days = calcDays(v.vencimentoDoc);
        if (days <= 30 && days > 0) warning++;
      }

      const docsCount = (v.documentos || []).length;

      vehicleList.innerHTML += `
        <div class="operator-card" style="cursor:pointer;" onclick="window.location.href='cadastro_veiculo.html?veiculoID=${index + 1}'">
          <div class="operator-top">
            <div>
              <h3>${v.modelo}</h3>
              <p>${v.categoria}</p>
            </div>
            <div class="status ${statusClass(v.status)}">${v.status}</div>
          </div>
          <div class="operator-info">
            <p><strong>Placa:</strong> ${v.placa}</p>
            <p><strong>Ano:</strong> ${v.ano || "-"}</p>
            <p><strong>Responsável:</strong> ${v.responsavel || "-"}</p>
            <p><strong>Docs anexados:</strong> ${docsCount} arquivo${docsCount !== 1 ? "s" : ""}</p>
          </div>
          ${v.vencimentoDoc && calcDays(v.vencimentoDoc) <= 30 ? `<div class="alerts"><div class="alert warning-alert">Doc. vencendo em ${calcDays(v.vencimentoDoc)} dias</div></div>` : ""}
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
};
