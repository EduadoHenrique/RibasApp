window.onload = () => {
  // ── Parâmetros & estado ─────────────────────────────────────────────────
  const urlParams  = new URLSearchParams(window.location.search);
  const veiculoId  = parseInt(urlParams.get("veiculoID")) || 0;
  const isNew      = veiculoId === 0;
  const vehicleIdx = isNew ? -1 : veiculoId - 1;

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const isAdmin     = currentUser.role === "admin";

  let editMode = isNew && isAdmin; // novo veículo já começa editável (se admin)
  let vehicles  = JSON.parse(localStorage.getItem("vehicles")) || [];

  // ── Elementos ──────────────────────────────────────────────────────────
  const logoutBtn      = document.getElementById("logoutBtn");
  const editBtn        = document.getElementById("editBtn");
  const saveBtn        = document.getElementById("saveVehicle");
  const deleteSection  = document.getElementById("deleteSection");
  const deleteBtn      = document.getElementById("deleteVehicle");
  const adminActions   = document.getElementById("adminActions");
  const viewActions    = document.getElementById("viewActions");
  const uploadSection  = document.getElementById("uploadSection");
  const qrSection      = document.getElementById("qrSection");
  const readonlyBanner = document.getElementById("readonlyBanner");
  const veiculoIdBadge = document.getElementById("veiculoIdBadge");
  const formInputs     = ["modelo","categoria","placa","ano","responsavel","vencimentoDoc","status","obs"];

  // ── Volta para página correta conforme papel ────────────────────────────
  function backPage() {
    if (isAdmin) window.location.href = "admin.html";
    else if (currentUser.role === "rh") window.location.href = "rh.html";
    else window.location.href = "operador.html";
  }
  document.getElementById("btnVoltar")?.addEventListener("click", backPage);
  document.getElementById("btnVoltarView")?.addEventListener("click", backPage);

  // ── Logout ──────────────────────────────────────────────────────────────
  logoutBtn.addEventListener("click", () => RibasAuth.logout());

  // ── Inicializar interface ───────────────────────────────────────────────
  function init() {
    if (isNew) {
      document.getElementById("formTitle").innerText = "Novo Veículo";
      document.getElementById("formBadge").innerText = "Frota Industrial";
      veiculoIdBadge.textContent = "ID: Novo";
    } else {
      const v = vehicles[vehicleIdx];
      if (!v) { alert("Veículo não encontrado."); backPage(); return; }

      document.getElementById("formTitle").innerText = v.modelo;
      document.getElementById("formBadge").innerText = "Ficha do Veículo";
      veiculoIdBadge.textContent = `ID: ${veiculoId}`;

      // Preenche campos
      document.getElementById("modelo").value         = v.modelo         || "";
      document.getElementById("categoria").value      = v.categoria      || "";
      document.getElementById("placa").value          = v.placa          || "";
      document.getElementById("ano").value            = v.ano            || "";
      document.getElementById("responsavel").value    = v.responsavel    || "";
      document.getElementById("vencimentoDoc").value  = v.vencimentoDoc  || "";
      document.getElementById("status").value         = v.status         || "Liberado";
      document.getElementById("obs").value            = v.obs            || "";

      // QR Code
      renderQR(vehicleIdx);

      // Documentos
      renderDocs(v.documentos || []);
    }

    applyPermissions();
  }

  // ── Permissões & modo de exibição ───────────────────────────────────────
  function applyPermissions() {
    setInputsDisabled(!editMode);

    if (isAdmin) {
      editBtn.style.display     = (!isNew && !editMode) ? "inline-flex" : "none";
      adminActions.style.display = editMode ? "flex" : "none";
      viewActions.style.display  = (!isNew && !editMode) ? "flex" : "none";
      deleteSection.style.display = (!isNew && editMode) ? "block" : "none";
      uploadSection.style.display = (!isNew) ? "block" : "none"; // upload só em veículos salvos
      readonlyBanner.classList.remove("visible");
    } else {
      // Não-admin: somente visualização
      editBtn.style.display      = "none";
      adminActions.style.display = "none";
      viewActions.style.display  = "flex";
      deleteSection.style.display = "none";
      uploadSection.style.display = "none";
      readonlyBanner.classList.add("visible");
    }
  }

  function setInputsDisabled(disabled) {
    formInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
  }

  // ── Botão Editar (admin) ────────────────────────────────────────────────
  editBtn.addEventListener("click", () => {
    editMode = true;
    applyPermissions();
  });

  // ── Salvar ──────────────────────────────────────────────────────────────
  saveBtn.addEventListener("click", () => {
    const modelo = document.getElementById("modelo").value.trim();
    const placa  = document.getElementById("placa").value.trim();

    if (!modelo || !placa) {
      alert("Preencha pelo menos o Modelo e a Placa.");
      return;
    }

    const vehicleData = {
      modelo,
      categoria:     document.getElementById("categoria").value.trim(),
      placa,
      ano:           document.getElementById("ano").value,
      responsavel:   document.getElementById("responsavel").value.trim(),
      vencimentoDoc: document.getElementById("vencimentoDoc").value,
      status:        document.getElementById("status").value,
      obs:           document.getElementById("obs").value.trim(),
      documentos:    isNew ? [] : (vehicles[vehicleIdx]?.documentos || []),
      qrId:          isNew ? Date.now().toString(36) : (vehicles[vehicleIdx]?.qrId || Date.now().toString(36))
    };

    let allVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];

    if (isNew) {
      allVehicles.push(vehicleData);
      localStorage.setItem("vehicles", JSON.stringify(allVehicles));
      alert("Veículo cadastrado com sucesso! QR Code gerado.");
      const newIdx = allVehicles.length; // 1-based
      window.location.href = `cadastro_veiculo.html?veiculoID=${newIdx}`;
    } else {
      allVehicles[vehicleIdx] = vehicleData;
      localStorage.setItem("vehicles", JSON.stringify(allVehicles));
      alert("Veículo atualizado com sucesso!");
      editMode = false;
      vehicles = allVehicles;
      applyPermissions();
      renderQR(vehicleIdx);
    }
  });

  // ── Excluir ─────────────────────────────────────────────────────────────
  deleteBtn?.addEventListener("click", () => {
    const v = vehicles[vehicleIdx];
    if (!confirm(`Excluir permanentemente o veículo "${v?.modelo}"?`)) return;
    let allVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    allVehicles.splice(vehicleIdx, 1);
    localStorage.setItem("vehicles", JSON.stringify(allVehicles));
    alert("Veículo excluído.");
    window.location.href = "admin.html";
  });

  // ── QR Code ──────────────────────────────────────────────────────────────
  function renderQR(idx) {
    const v = (JSON.parse(localStorage.getItem("vehicles")) || [])[idx];
    if (!v) return;

    qrSection.classList.add("visible");

    // URL que aponta para a ficha do veículo (1-based)
    const qrUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, "")}cadastro_veiculo.html?veiculoID=${idx + 1}&view=1`;
    document.getElementById("qrLinkText").textContent = qrUrl;

    const canvas = document.getElementById("qrCanvas");
    canvas.innerHTML = "";
    new QRCode(canvas, {
      text: qrUrl,
      width: 160,
      height: 160,
      colorDark: "#1a1a2e",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    // Botão download
    document.getElementById("btnDownloadQR").addEventListener("click", () => {
      setTimeout(() => {
        const img = canvas.querySelector("img") || canvas.querySelector("canvas");
        if (!img) return;
        const link = document.createElement("a");
        link.download = `qr_${v.placa || "veiculo"}.png`;
        link.href = img.src || img.toDataURL();
        link.click();
      }, 200);
    });
  }

  // ── Upload de documentos ─────────────────────────────────────────────────
  const fileInput      = document.getElementById("fileInput");
  const fileNameDisp   = document.getElementById("fileNameDisplay");
  const uploadZone     = document.getElementById("uploadZone");
  const btnUpload      = document.getElementById("btnUpload");

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        const f = e.target.files[0];
        if (f.size > 5 * 1024 * 1024) {
          alert("Arquivo muito grande. Máximo permitido: 5MB.");
          fileInput.value = "";
          return;
        }
        fileNameDisp.textContent = `✓ ${f.name}`;
        fileNameDisp.style.display = "block";
      }
    });

    // Drag & drop
    uploadZone.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.classList.add("dragover"); });
    uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
      }
    });
  }

  if (btnUpload) {
    btnUpload.addEventListener("click", () => {
      if (!fileInput?.files.length) {
        alert("Selecione um arquivo antes de anexar.");
        return;
      }

      const file     = fileInput.files[0];
      const tipoDoc  = document.getElementById("tipoDoc").value;
      const reader   = new FileReader();

      reader.onload = (e) => {
        const docEntry = {
          tipo:     tipoDoc,
          nome:     file.name,
          tamanho:  (file.size / 1024).toFixed(1) + " KB",
          data:     new Date().toLocaleDateString("pt-BR"),
          dataUrl:  e.target.result  // base64 para preview
        };

        let allVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
        if (!allVehicles[vehicleIdx].documentos) allVehicles[vehicleIdx].documentos = [];
        allVehicles[vehicleIdx].documentos.push(docEntry);
        localStorage.setItem("vehicles", JSON.stringify(allVehicles));
        vehicles = allVehicles;

        renderDocs(allVehicles[vehicleIdx].documentos);
        fileInput.value = "";
        fileNameDisp.style.display = "none";
        fileNameDisp.textContent = "";
        alert("Documento anexado com sucesso!");
      };
      reader.readAsDataURL(file);
    });
  }

  function renderDocs(docs) {
    const list = document.getElementById("docList");
    const emptyMsg = document.getElementById("emptyDocs");
    if (!list) return;

    // Remove itens anteriores mas mantém a mensagem vazia
    Array.from(list.querySelectorAll(".doc-item")).forEach(el => el.remove());

    if (!docs || docs.length === 0) {
      emptyMsg.style.display = "block";
      return;
    }

    emptyMsg.style.display = "none";
    docs.forEach((doc, i) => {
      const item = document.createElement("div");
      item.className = "doc-item";
      item.innerHTML = `
        <div>
          <span>📄 ${doc.tipo}</span>
          <div class="doc-meta">${doc.nome} · ${doc.tamanho} · ${doc.data}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${doc.dataUrl ? `<a href="${doc.dataUrl}" download="${doc.nome}" class="save-btn" style="padding:4px 10px; font-size:0.8rem; background:#0275d8;">⬇</a>` : ""}
          ${isAdmin ? `<button class="doc-remove" data-idx="${i}" title="Remover">✕</button>` : ""}
        </div>
      `;
      list.appendChild(item);
    });

    // Remover documento
    list.querySelectorAll(".doc-remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        let allVehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
        allVehicles[vehicleIdx].documentos.splice(idx, 1);
        localStorage.setItem("vehicles", JSON.stringify(allVehicles));
        vehicles = allVehicles;
        renderDocs(allVehicles[vehicleIdx].documentos);
      });
    });
  }

  // ── Iniciar ──────────────────────────────────────────────────────────────
  init();
};
