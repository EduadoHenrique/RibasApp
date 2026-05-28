window.onload = () => {

  const params =
    new URLSearchParams(window.location.search);

  const veiculoID =
    Number(params.get("veiculoID"));

  const vehicles =
    JSON.parse(localStorage.getItem("vehicles")) || [];

  const backBtn =
    document.getElementById("backBtn");

  const deleteBtn =
    document.getElementById("deleteVehicle");

  backBtn.addEventListener("click", () => {

    window.location.href =
      "./admin.html";
  });

  if (veiculoID === 0) {

    deleteBtn.style.display = "none";
  }

  if (veiculoID !== 0) {

    const vehicle = vehicles[veiculoID];

    document.getElementById("placa").value =
      vehicle.placa;

    document.getElementById("modelo").value =
      vehicle.modelo;

    document.getElementById("categoria").value =
      vehicle.categoria;

    document.getElementById("status").value =
      vehicle.status;

    document.getElementById("capacidade").value =
      vehicle.capacidade;

    document.getElementById("inspecao").value =
      vehicle.inspecao;
  }

  document
    .getElementById("saveVehicle")
    .addEventListener("click", saveVehicle);

  deleteBtn.addEventListener("click", deleteVehicle);

  function saveVehicle() {

    const vehicle = {

      placa: value("placa"),

      modelo: value("modelo"),

      categoria: value("categoria"),

      status: value("status"),

      capacidade: value("capacidade"),

      inspecao: value("inspecao")
    };

    if (veiculoID === 0) {

      vehicles.push(vehicle);

    } else {

      vehicles[veiculoID] = vehicle;
    }

    localStorage.setItem(
      "vehicles",
      JSON.stringify(vehicles)
    );

    alert("Veículo salvo com sucesso.");

    window.location.href =
      "./admin.html";
  }

  function deleteVehicle() {

    const confirmDelete =
      confirm("Deseja excluir este veículo?");

    if (!confirmDelete) return;

    vehicles.splice(veiculoID, 1);

    localStorage.setItem(
      "vehicles",
      JSON.stringify(vehicles)
    );

    alert("Veículo removido.");

    window.location.href =
      "./admin.html";
  }

  function value(id) {

    return document.getElementById(id).value;
  }

};