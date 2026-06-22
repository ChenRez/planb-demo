/* adminLoginPage.js — מסך כניסת אדמין */

function showAdminError(msg) {
  const box = document.getElementById("adminErrorMsg");
  box.innerHTML =
    '<i class="fas fa-exclamation-circle" style="margin-left: 5px"></i>' + msg;
  box.style.display = "block";
}

function handleAdminLogin(event) {
  event.preventDefault();

  const box = document.getElementById("adminErrorMsg");
  box.style.display = "none";

  const btn = event.submitter;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  const data = {
    email:    document.getElementById("adminEmail").value,
    password: document.getElementById("adminPass").value
  };

  ajaxCall("POST", "/api/auth/login", data,
    function (res) {
      if (res.role !== "admin") {
        btn.disabled = false;
        btn.textContent = "התחברות";
        showAdminError("אין לך הרשאת מנהל למערכת זו");
        return;
      }
      localStorage.setItem("userId",    res.userId);
      localStorage.setItem("firstName", res.firstName);
      localStorage.setItem("role",      res.role);
      window.location.href = "admin-dashboard.html";
    },
    function (err) {
      btn.disabled = false;
      btn.textContent = "התחברות";
      const serverMsg = err.responseJSON && err.responseJSON.message;
      let msg;
      if (err.status === 401) msg = "אימייל או סיסמה שגויים";
      else if (err.status === 403) msg = serverMsg || "החשבון מושעה, פנה לתמיכה";
      else if (err.status === 400) msg = serverMsg || "נתונים חסרים או שגויים";
      else msg = "שגיאה בהתחברות, נסי שוב";
      showAdminError(msg);
    }
  );
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
