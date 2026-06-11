window.onload = () => {
  const saveVehicle = document.getElementById("saveVehicle");
  const logoutBtn = document.getElementById("logoutBtn");

  // Captura o parâmetro da URL
  const urlParams = new URLSearchParams(window.location.search);
  const veiculoIdParam = urlParams.get("veiculoID");

  const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

  // Se o parâmetro existe, não é nulo e não é a palavra "novo", então é uma EDIÇÃO
  const isEdit = (veiculoIdParam !== null && veiculoIdParam !== "novo");
  
  // Se for edição, o índice do veículo é exatamente o número vindo da URL (0, 1, 2...)
  const vehicleIndex = isEdit ? parseInt(veiculoIdParam, 10) : -1;

  // Carrega os dados se for Edição de um veículo existente
  if (isEdit && vehicles[vehicleIndex]) {
    const v = vehicles[vehicleIndex];
    document.getElementById("formTitle").innerText = "Editar Veículo";
    document.getElementById("formBadge").innerText = "Edição de Frota";

    document.getElementById("modelo").value = v.modelo || "";
    document.getElementById("categoria").value = v.categoria || "";
    document.getElementById("placa").value = v.placa || "";
    document.getElementById("status").value = v.status || "Liberado";
  } else {
    // Garante que se for um novo veículo, o título esteja correto
    document.getElementById("formTitle").innerText = "Novo Veículo";
    document.getElementById("formBadge").innerText = "Frota Industrial";
  }

  // Salvar ou Editar
  saveVehicle.addEventListener("click", () => {
    const vehicleData = {
      modelo: document.getElementById("modelo").value,
      categoria: document.getElementById("categoria").value,
      placa: document.getElementById("placa").value,
      status: document.getElementById("status").value
    };

    if (!vehicleData.modelo || !vehicleData.placa) {
      alert("Por favor, preencha o Modelo e a Placa.");
      return;
    }

    if (isEdit && vehicleIndex >= 0) {
      // Edita exatamente o veículo clicado na lista operacional
      vehicles[vehicleIndex] = vehicleData;
    } else {
      // Adiciona um novo veículo ao final da lista
      vehicles.push(vehicleData);
    }

    localStorage.setItem("vehicles", JSON.stringify(vehicles));
    window.location.href = "admin.html"; // Volta para a lista operacional atualizada
  });

  logoutBtn.addEventListener("click", () => RibasAuth.logout());
};