/**
 * app.js — Login do Ribas App
 * Senha padrão de primeiro acesso: Ribas@2024
 */
const DEFAULT_PASSWORD = "Ribas@2024";

const loginBtn   = document.getElementById("loginBtn");
const accessCards = document.querySelectorAll(".access-card");

// Seleção de card de acesso
accessCards.forEach((card) => {
  card.addEventListener("click", () => {
    accessCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
  });
});

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const selected = document.querySelector(".access-card.active");
    if (!selected) { alert("Selecione um nível de acesso."); return; }

    const access = selected.innerText.trim().toLowerCase();
    let user = null;

    if (access.includes("administrador")) {
      user = {
        role: "admin",
        nome: "Gestor de Operações",
        matricula: "ADM-7716",
        funcao: "Administrador Master",
        email: "admin.operacional@ribas.com",
        password: DEFAULT_PASSWORD   // primeiro login
      };
    } else if (access.includes("rh")) {
      user = {
        role: "rh",
        nome: "Carlos Henrique Silva",
        matricula: "M-88492",
        funcao: "Analista de Recursos Humanos",
        email: "carlos.rh@ribas.com",
        password: DEFAULT_PASSWORD
      };
    } else if (access.includes("operador")) {
      // Tenta encontrar o operador na lista cadastrada pelo RH;
      // Se não existir ainda, usa dados de demonstração
      const operators = JSON.parse(localStorage.getItem("operators")) || [];
      const match = operators.find(op =>
        op.matricula === (document.querySelector("input[type='text']")?.value?.trim() || "")
      );
      user = match
        ? { role: "operador", ...match, password: match.password || DEFAULT_PASSWORD }
        : {
            role: "operador",
            nome: "Marcos de Souza Silva",
            matricula: "OP-2026-9",
            funcao: "Operador de Guindaste Pesado",
            cnh: "E",
            validadeCnh: "2028-12-12",
            aso: "2026-10-15",
            treinamento: "NR-11 Guindaste",
            validadeTreinamento: "2027-03-01",
            status: "Ativo",
            responsavel: "",  // campo para vincular veículos
            password: DEFAULT_PASSWORD
          };
    }

    if (!user) { alert("Nível de acesso não reconhecido."); return; }

    localStorage.setItem("currentUser", JSON.stringify(user));

    // Redireciona (auth.js nas páginas destino detectará primeiro login)
    const redirect = sessionStorage.getItem("redirectAfterLogin");
    sessionStorage.removeItem("redirectAfterLogin");

    const map = { admin: "pages/admin.html", rh: "pages/rh.html", operador: "pages/operador.html" };
    window.location.href = redirect && redirect !== window.location.href
      ? redirect
      : map[user.role];
  });
}
