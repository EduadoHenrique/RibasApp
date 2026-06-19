/**
 * cadastro_veiculo.js — Ficha de veículo (criar/editar/visualizar)
 *
 * Usa RibasAPI.Veiculos (POST/GET/PUT/DELETE /veiculos) e
 * RibasAPI.DocumentosVeiculo (POST/GET/DELETE /documentos-veiculo).
 *
 * Documentos: o backend só guarda uma URL (documentoUrl), não o arquivo.
 * Por isso o anexo aqui é feito colando um link (Drive, OneDrive etc.).
 */

window.onload = () => {
  // ── Parâmetros & estado ─────────────────────────────────────────────────
  const urlParams  = new URLSearchParams(window.location.search);
  const veiculoIdParam = urlParams.get("veiculoID");
  const isNew      = !veiculoIdParam || veiculoIdParam === "novo" || veiculoIdParam === "0";
  const veiculoId  = isNew ? null : veiculoIdParam;

  const currentUser = (window.RibasAuth && window.RibasAuth.user) || {};
  const isAdmin     = currentUser.role === "admin";

  let editMode = isNew && isAdmin; // novo veículo já começa editável (se admin)
  let currentVeiculo = null; // dados carregados da API
  let currentDocumentos = []; // documentos deste veículo

  // ── Elementos ──────────────────────────────────────────────────────────
  const logoutBtn      = document.getElementById("logoutBtn");
  const editBtn        = document.getElementById("editBtn");
  const saveBtn         = document.getElementById("saveVehicle");
  const deleteSection  = document.getElementById("deleteSection");
  const deleteBtn       = document.getElementById("deleteVehicle");
  const adminActions   = document.getElementById("adminActions");
  const viewActions     = document.getElementById("viewActions");
  const uploadSection  = document.getElementById("uploadSection");
  const qrSection       = document.getElementById("qrSection");
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
  async function init() {
    if (isNew) {
      document.getElementById("formTitle").innerText = "Novo Veículo";
      document.getElementById("formBadge").innerText = "Frota Industrial";
      veiculoIdBadge.textContent = "ID: Novo";
      applyPermissions();
      return;
    }

    try {
      const v = await RibasAPI.Veiculos.getById(veiculoId);
      currentVeiculo = v;

      document.getElementById("formTitle").innerText = v.modelo;
      document.getElementById("formBadge").innerText = "Ficha do Veículo";
      veiculoIdBadge.textContent = `ID: ${veiculoId}`;

      // Preenche campos
      document.getElementById("modelo").value         = v.modelo         || "";
      document.getElementById("categoria").value      = v.categoria      || "GUINDASTE";
      document.getElementById("placa").value          = v.placa          || "";
      document.getElementById("ano").value            = v.ano            || "";
      document.getElementById("responsavel").value    = v.operador?.nome || "";
      document.getElementById("vencimentoDoc").value  = toDateInputValue(v.ultimaInspecao);
      document.getElementById("status").value         = v.status         || "Liberado";
      document.getElementById("obs").value             = v.obs            || "";

      // QR Code
      renderQR();

      // Documentos
      await loadDocumentos();
    } catch (error) {
      alert("Veículo não encontrado: " + error.message);
      backPage();
      return;
    }

    applyPermissions();
  }

  function toDateInputValue(dateLike) {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
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
  saveBtn.addEventListener("click", async () => {
    const modelo = document.getElementById("modelo").value.trim();
    const placa  = document.getElementById("placa").value.trim();

    if (!modelo || !placa) {
      alert("Preencha pelo menos o Modelo e a Placa.");
      return;
    }

    const vehicleData = {
      modelo,
      categoria:      document.getElementById("categoria").value,
      placa,
      ano:            document.getElementById("ano").value || undefined,
      status:         document.getElementById("status").value,
      ultimaInspecao: document.getElementById("vencimentoDoc").value || undefined
      // obs/responsavel não existem no model Veiculo do backend hoje,
      // por isso não são enviados (campo "responsavel" deveria ser o
      // ObjectId de um User em "operador" — fora do escopo desta tela).
    };

    saveBtn.disabled = true;

    try {
      if (isNew) {
        const created = await RibasAPI.Veiculos.create(vehicleData);
        alert("Veículo cadastrado com sucesso!");
        window.location.href = `cadastro_veiculo.html?veiculoID=${created._id}`;
      } else {
        await RibasAPI.Veiculos.update(veiculoId, vehicleData);
        alert("Veículo atualizado com sucesso!");
        editMode = false;
        await init();
      }
    } catch (error) {
      alert("Não foi possível salvar o veículo: " + error.message);
    } finally {
      saveBtn.disabled = false;
    }
  });

  // ── Excluir ─────────────────────────────────────────────────────────────
  deleteBtn?.addEventListener("click", async () => {
    if (!confirm(`Excluir permanentemente o veículo "${currentVeiculo?.modelo}"?`)) return;

    try {
      await RibasAPI.Veiculos.remove(veiculoId);
      alert("Veículo desativado.");
      window.location.href = "admin.html";
    } catch (error) {
      alert("Não foi possível excluir o veículo: " + error.message);
    }
  });

  // ── QR Code ──────────────────────────────────────────────────────────────
  function renderQR() {
    if (!currentVeiculo) return;

    qrSection.classList.add("visible");

    // URL que aponta para a ficha do veículo
    const qrUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, "")}cadastro_veiculo.html?veiculoID=${veiculoId}&view=1`;
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
    const btnDownloadQR = document.getElementById("btnDownloadQR");
    btnDownloadQR.onclick = () => {
      setTimeout(() => {
        const img = canvas.querySelector("img") || canvas.querySelector("canvas");
        if (!img) return;
        const link = document.createElement("a");
        link.download = `qr_${currentVeiculo.placa || "veiculo"}.png`;
        link.href = img.src || img.toDataURL();
        link.click();
      }, 200);
    };
  }

  // ── Documentos (via API) ────────────────────────────────────────────────
  const documentoUrlInput = document.getElementById("documentoUrl");
  const btnUpload          = document.getElementById("btnUpload");

  async function loadDocumentos() {
    try {
      const todos = await RibasAPI.DocumentosVeiculo.list();
      currentDocumentos = todos.filter(d => {
        const vid = d.veiculoId?._id || d.veiculoId;
        return vid === veiculoId;
      });
    } catch (error) {
      currentDocumentos = [];
    }
    renderDocs();
  }

  if (btnUpload) {
    btnUpload.addEventListener("click", async () => {
      const tipoDoc = document.getElementById("tipoDoc").value;
      const url = documentoUrlInput.value.trim();

      if (!url) {
        alert("Cole o link do documento antes de anexar.");
        return;
      }

      btnUpload.disabled = true;
      try {
        await RibasAPI.DocumentosVeiculo.create({
          veiculoId,
          nome: tipoDoc,
          documentoUrl: url
        });
        documentoUrlInput.value = "";
        await loadDocumentos();
        alert("Documento anexado com sucesso!");
      } catch (error) {
        alert("Não foi possível anexar o documento: " + error.message);
      } finally {
        btnUpload.disabled = false;
      }
    });
  }

  function renderDocs() {
    const list = document.getElementById("docList");
    const emptyMsg = document.getElementById("emptyDocs");
    if (!list) return;

    Array.from(list.querySelectorAll(".doc-item")).forEach(el => el.remove());

    if (!currentDocumentos || currentDocumentos.length === 0) {
      emptyMsg.style.display = "block";
      return;
    }

    emptyMsg.style.display = "none";
    currentDocumentos.forEach((doc) => {
      const item = document.createElement("div");
      item.className = "doc-item";
      const dataFormatada = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString("pt-BR") : "";
      item.innerHTML = `
        <div>
          <span>📄 ${doc.nome}</span>
          <div class="doc-meta">${dataFormatada}</div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <a href="${doc.documentoUrl}" target="_blank" rel="noopener" class="save-btn" style="padding:4px 10px; font-size:0.8rem; background:#0275d8;">Abrir</a>
          ${isAdmin ? `<button class="doc-remove" data-id="${doc._id}" title="Remover">✕</button>` : ""}
        </div>
      `;
      list.appendChild(item);
    });

    // Remover documento
    list.querySelectorAll(".doc-remove").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await RibasAPI.DocumentosVeiculo.remove(id);
          await loadDocumentos();
        } catch (error) {
          alert("Não foi possível remover o documento: " + error.message);
        }
      });
    });
  }

  // ── Iniciar ──────────────────────────────────────────────────────────────
  init();
};
