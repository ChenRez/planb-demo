/* queuePage.js — לוגיקת מסך התור החכם */

let timeLeft = 300;
const timerDisplay = document.getElementById("timer");

function startTimer() {
  const interval = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(interval);
      timerDisplay.innerText = "00:00";
      alert("הזמן לרכישה עבר. הכרטיס עבר לבא בתור.");
      window.location.href = "home.html";
      return;
    }
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    timeLeft--;
  }, 1000);
}

function proceedToPayment() {
  var listingId = getUrlParam("listingId") || "";
  var title     = getUrlParam("itemName")  || "";
  window.location.href = "payment.html?id=" + listingId + "&title=" + encodeURIComponent(title);
}

/* לוגיקת ויתור (Pass) */
function openPassModal() {
  document.getElementById("passConfirmationModal").classList.add("open");
}

function closePassModal() {
  document.getElementById("passConfirmationModal").classList.remove("open");
}

function confirmPass() {
  window.location.href = "home.html";
}

/* לוגיקת מודל פרטים */
function openDetails() {
  document.getElementById("detailsModal").classList.add("open");
}

function closeDetails() {
  document.getElementById("detailsModal").classList.remove("open");
}

window.onload = function () {
  if (!requireAuth()) return;
  startTimer();
};

// ── Waitlist API integration ──────────────────────────────────

// Read listing context from URL params (?listingId=X&itemName=Y)
function getUrlParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

function joinWaitlistAndPass() {
    const userId     = localStorage.getItem("userId");
    const listingId  = getUrlParam("listingId") ? parseInt(getUrlParam("listingId")) : null;
    const itemName   = getUrlParam("itemName")  || document.querySelector(".card-title")?.innerText || null;

    const entry = {
        userId:     parseInt(userId),
        listingId:  listingId,
        categoryId: null,
        itemName:   itemName
    };

    addToWaitlist(
        entry,
        function () {
            closePassModal();
            showWaitlistToast("נרשמת לתור! נעדכן אותך ברגע שיתפנה כרטיס דומה.");
            setTimeout(() => { window.location.href = "home.html"; }, 2000);
        },
        function () {
            closePassModal();
            window.location.href = "home.html";
        }
    );
}

function showWaitlistToast(msg) {
    const toast = document.createElement("div");
    toast.innerText = msg;
    Object.assign(toast.style, {
        position:     "fixed",
        bottom:       "30px",
        left:         "50%",
        transform:    "translateX(-50%)",
        background:   "#2d3436",
        color:        "#fff",
        padding:      "14px 22px",
        borderRadius: "20px",
        fontSize:     "14px",
        fontWeight:   "600",
        zIndex:       "9999",
        boxShadow:    "0 8px 25px rgba(0,0,0,0.2)",
        textAlign:    "center",
        maxWidth:     "85%"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Load and log current user waitlist on page ready (silent — no UI injection)
$(document).ready(function () {
    const userId = localStorage.getItem("userId");

    getWaitlist(
        userId,
        function (entries) {
            // Waitlist loaded — available for future use (e.g. badge counts)
            console.log("Waitlist entries:", entries.length);
        },
        function () {
            // Non-critical — silent failure
        }
    );
});
