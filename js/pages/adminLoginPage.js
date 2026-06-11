/* adminLoginPage.js — מסך כניסת אדמין */

function handleAdminLogin(event) {
  event.preventDefault();
  window.location.href = "admin-dashboard.html";
}

function togglePasswordVisibility() {
  const passInput = document.getElementById("adminPass");
  const icon = document.querySelector(".toggle-password");
  if (passInput.type === "password") {
    passInput.type = "text";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    passInput.type = "password";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  }
}
