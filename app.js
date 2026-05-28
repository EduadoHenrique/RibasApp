const loginBtn =
  document.getElementById("loginBtn");

const accessCards =
  document.querySelectorAll(".access-card");

/* SELEÇÃO DOS CARDS */

accessCards.forEach((card) => {

  card.addEventListener("click", () => {

    accessCards.forEach((c) => {
      c.classList.remove("active");
    });

    card.classList.add("active");

  });

});

/* LOGIN FAKE */

if (loginBtn) {

  loginBtn.addEventListener("click", () => {

    const selected =
      document.querySelector(".access-card.active");

    if (!selected) {
      alert("Selecione um nível de acesso.");
      return;
    }

    const access =
      selected.innerText
        .trim()
        .toLowerCase();

    /* ADMIN */

    if (access.includes("administrador")) {

      window.location.href =
        "pages/admin.html";

      return;
    }

    /* RH */

    if (access.includes("rh")) {

      window.location.href =
        "pages/rh.html";

      return;
    }

    /* OPERADOR */

    if (access.includes("operador")) {

  window.location.href =
    "pages/operador.html";

  return;
}

  });

}