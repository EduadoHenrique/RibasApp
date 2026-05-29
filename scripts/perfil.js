const savePassword = document.getElementById("savePassword");
const logoutBtn = document.getElementById("logoutBtn");

savePassword.addEventListener("click", () => {
  const novaSenha = document.getElementById("novaSenha").value;
  const confirmaSenha = document.getElementById("confirmaSenha").value;

  if (!novaSenha || !confirmaSenha) {
    alert("Por favor, preencha ambos os campos de senha.");
    return;
  }

  if (novaSenha !== afirmaSenha) {
    alert("As senhas informadas não coincidem. Tente novamente.");
    return;
  }

  // Lógica de salvar a senha no LocalStorage ou banco
  localStorage.setItem("userPassword", novaSenha);
  alert("Senha atualizada com sucesso!");
  
  document.getElementById("novaSenha").value = "";
  document.getElementById("confirmaSenha").value = "";
});

logoutBtn.addEventListener("click", () => {
  alert("Deslogando do sistema...");
  window.location.href = "login.html";
});