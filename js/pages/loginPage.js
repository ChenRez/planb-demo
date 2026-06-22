function showToast(msg) {
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document.querySelector(".eye-icon").addEventListener("click", function () {
  const input = document.getElementById("password");
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  this.classList.toggle("fa-eye", isHidden);
  this.classList.toggle("fa-eye-slash", !isHidden);
});

function handleLogin(event) {
  event.preventDefault();

  const btn = event.submitter;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  const data = {
    email:    document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  ajaxCall("POST", "/api/auth/login", data,
    function (res) {
      localStorage.setItem("userId",    res.userId);
      localStorage.setItem("firstName", res.firstName);
      localStorage.setItem("role",      res.role);
      window.location.href = "home.html";
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
      showToast(msg);
    }
  );
}
