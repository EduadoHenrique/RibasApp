/**
 * operador.js — Painel do Operador (meus veículos)
 * Usa RibasAPI.Veiculos (GET /veiculos).
 *
 * Filtra os veículos cujo campo "operador" (ObjectId no backend, populado
 * como objeto) corresponde ao usuário logado.
 */

window.addEventListener("DOMContentLoaded", () => {
  const user = RibasAuth.user;

  // Personaliza o título com o nome do operador
  document.getElementById("welcomeTitle").textContent =
    user.nome ? `Olá, ${user.nome.split(" ")[0]}` : "Painel do Operador";

  document.getElementById("logoutBtn").addEventListener("click", () => RibasAuth.logout());

  renderMyVehicles();

  async function renderMyVehicles() {
    const list = document.getElementById("myVehicleList");
    list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Carregando seus veículos...</div>`;

    let allVehicles = [];
    try {
      allVehicles = await RibasAPI.Veiculos.list();
    } catch (error) {
      list.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#c0392b;">
          <p style="font-size:1.1rem;">Não foi possível carregar seus veículos.</p>
          <p style="font-size:0.9rem; margin-top:8px;">${error.message}</p>
        </div>`;
      return;
    }

    // Filtra veículos cujo operador vinculado é o usuário logado
    const meus = allVehicles.filter(v => {
      const operadorId = v.operador?._id || v.operador;
      return operadorId && user.id && operadorId === user.id;
    });

    // Stats
    const bloqueados = meus.filter(v => v.status === "Bloqueado").length;
    const vencendo   = meus.filter(v => {
      if (!v.ultimaInspecao) return false;
      const days = Math.ceil((new Date(v.ultimaInspecao) - new Date()) / 86400000);
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
      const vencDays  = v.ultimaInspecao
        ? Math.ceil((new Date(v.ultimaInspecao) - new Date()) / 86400000)
        : null;

      list.innerHTML += `
        <div class="operator-card" style="cursor:pointer;"
             onclick="window.location.href='cadastro_veiculo.html?veiculoID=${v._id}'">
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
          </div>
          ${vencDays !== null && vencDays <= 30
            ? `<div class="alerts"><div class="alert ${vencDays < 0 ? "danger-alert" : "warning-alert"}">
                Inspeção ${vencDays < 0 ? "vencida há " + Math.abs(vencDays) : "vencendo em " + vencDays} dias
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

  function categoriaLabel(cat) {
    const map = { GUINDASTE: "Guindaste", CAMINHAO: "Caminhão", MUNCK: "Munck", EMPILHADEIRA: "Empilhadeira" };
    return map[cat] || cat || "-";
  }
});
