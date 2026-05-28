window.onload = () => {

  const newVehicle =
    document.getElementById("newVehicle");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const vehicleList =
    document.getElementById("vehicleList");

  newVehicle.addEventListener("click", () => {

    window.location.href =
      "./veiculo.html?veiculoID=0";
  });

  logoutBtn.addEventListener("click", () => {

    window.location.href =
      "../index.html";
  });

  renderVehicles();

  function renderVehicles() {

    const vehicles =
      JSON.parse(localStorage.getItem("vehicles")) || [];

    vehicleList.innerHTML = "";

    if (vehicles.length === 0) {

      vehicleList.innerHTML = `

        <div class="empty-card">

          Nenhum veículo cadastrado.

        </div>
      `;

      return;
    }

    vehicles.forEach((vehicle, index) => {

      vehicleList.innerHTML += `

        <div
          class="operator-card"
          onclick="editVehicle(${index})"
        >

          <div class="operator-top">

            <div>

              <h3>${vehicle.modelo}</h3>

              <p>${vehicle.categoria}</p>

            </div>

            <div class="status ${statusClass(vehicle.status)}">

              ${vehicle.status}

            </div>

          </div>

          <div class="operator-info">

            <p>

              <strong>Placa:</strong>

              ${vehicle.placa}

            </p>

          </div>

        </div>
      `;
    });

  }

  window.editVehicle = (index) => {

    window.location.href =
      `./veiculo.html?veiculoID=${index}`;
  };

  function statusClass(status) {

    if (status === "Liberado") {
      return "green-status";
    }

    if (status === "Bloqueado") {
      return "red-status";
    }

    return "yellow-status";
  }

};