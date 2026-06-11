window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Personaliza o título com o nome do operador
  document.getElementById("welcomeTitle").textContent =
    user.nome ? `Olá, ${user.nome.split(" ")[0]}` : "Painel do Operador";

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());

  renderMyVehicles();

  function renderMyVehicles() {
    const allVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    const list = document.getElementById("myVehicleList");

    // Filtra veículos cujo responsável bate com o nome ou matrícula do operador logado
    const meus = allVehicles
      .map((v, i) => ({ ...v, idx: i }))
      .filter(v => {
        if (!v.responsavel) return false;
        const resp = v.responsavel.toLowerCase();
        return resp.includes(user.nome?.toLowerCase() || "___") ||
               resp.includes(user.matricula?.toLowerCase() || "___");
      });

    // Stats
    const bloqueados = meus.filter(v => v.status === "Bloqueado").length;
    const vencendo   = meus.filter(v => {
      if (!v.vencimentoDoc) return false;
      const days = Math.ceil((new Date(v.vencimentoDoc) - new Date()) / 86400000);
      return days >= 0 && days <= 30;
    }).length;

    document.getElementById("statMeusVeiculos").textContent = String(meus.length).padStart(2, "0");
    document.getElementById("statBloqueados").textContent   = String(bloqueados).padStart(2, "0");
    document.getElementById("statVencendo").textContent     = String(vencendo).padStart(2, "0");

    if (meus.length === 0) {
      list.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">
          <p style="font-size:1.1rem;">Nenhum veículo está registrado no seu nome.</p>
          <p style="font-size:0.9rem; margin-top:8px;">Solicite ao Administrador que vincule equipamentos ao seu nome.</p>
        </div>`;
      return;
    }

    list.innerHTML = "";
    meus.forEach(v => {
      const veiculoId = v.idx + 1;
      const docsCount = (v.documentos || []).length;
      const vencDays  = v.vencimentoDoc
        ? Math.ceil((new Date(v.vencimentoDoc) - new Date()) / 86400000)
        : null;

      list.innerHTML += `
        <div class="operator-card" style="cursor:pointer;"
             onclick="window.location.href='cadastro_veiculo.html?veiculoID=${veiculoId}'">
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
            <p><strong>Docs:</strong> ${docsCount} arquivo${docsCount !== 1 ? "s" : ""}</p>
          </div>
          ${vencDays !== null && vencDays <= 30
            ? `<div class="alerts"><div class="alert ${vencDays < 0 ? "danger-alert" : "warning-alert"}">
                Doc. ${vencDays < 0 ? "vencida há " + Math.abs(vencDays) : "vencendo em " + vencDays} dias
               </div></div>`
            : ""}
        </div>
      `;
    });
  }

  function statusClass(s) {
    if (s === "Liberado")      return "green-status";
    if (s === "Bloqueado")     return "red-status";
    return "yellow-status";
  }
});
