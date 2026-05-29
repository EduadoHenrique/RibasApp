window.onload = () => {
    const updatePasswordBtn = document.getElementById("updatePasswordBtn");
    const logoutBtn = document.getElementById("logoutBtn");
  
    updatePasswordBtn.addEventListener("click", () => {
      const novaSenha = document.getElementById("novaSenha").value;
      const confirmaSenha = document.getElementById("confirmaSenha").value;
  
      if (!novaSenha || !confirmaSenha) {
        alert("Preencha os dois campos para alterar sua senha.");
        return;
      }
  
      if (novaSenha !== confirmaSenha) {
        alert("Erro: As senhas digitadas não batem.");
        return;
      }
  
      // Salva a credencial modificada de forma segura/persistida
      localStorage.setItem("adminPassword", novaSenha);
      alert("Senha administrativa atualizada com sucesso!");
  
      document.getElementById("novaSenha").value = "";
      document.getElementById("confirmaSenha").value = "";
    });
  
    logoutBtn.addEventListener("click", () => {
      alert("Efetuando logout...");
      window.location.href = "../index.html";
    });
  };