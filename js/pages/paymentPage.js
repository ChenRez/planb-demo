/* paymentPage.js — לוגיקת מסך התשלום */

let currentMethod = "card";
let totalPrice = 0;

/* טעינת פרטים מה-URL בעת טעינת הדף */
window.onload = function () {
  if (!requireAuth()) return;
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const priceStr = params.get("price");

  if (title && priceStr) {
    const qty      = parseInt(params.get("qty")) || 1;
    const priceNum = parseInt(priceStr.replace(/\D/g, ""));
    totalPrice = (priceNum * qty) + 5;

    document.getElementById("payItemName").innerText  = title + (qty > 1 ? " (" + qty + " כרטיסים)" : "");
    document.getElementById("payItemPrice").innerText = qty > 1
      ? priceNum + "₪ × " + qty
      : priceStr;
    document.getElementById("payTotal").innerText = totalPrice + "₪";
    updateButtonText();
  }
};

function selectPaymentMethod(method, element) {
  document.querySelectorAll(".pay-method-container").forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");

  const form = document.getElementById("creditCardForm");
  if (method === "card") {
    form.style.display = "flex";
  } else {
    form.style.display = "none";
  }

  currentMethod = method;
  updateButtonText();
}

function updateButtonText() {
  const btn = document.getElementById("submitBtn");
  if (currentMethod === "bit") {
    btn.innerText = `שלם באמצעות Bit (${totalPrice}₪)`;
    btn.style.background = "#00b8d4";
  } else if (currentMethod === "paybox") {
    btn.innerText = `שלם באמצעות PayBox (${totalPrice}₪)`;
    btn.style.background = "#2e3192";
  } else {
    btn.innerText = `שלם באשראי (${totalPrice}₪)`;
    btn.style.background = "var(--brand-gradient)";
  }
}

function processPayment() {
  const btn = document.getElementById("submitBtn");
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> מעבד תשלום...';
  btn.style.opacity = "0.8";
  btn.disabled = true;

  const params    = new URLSearchParams(window.location.search);
  const listingId = parseInt(params.get("id"))       || 0;
  const sellerId  = parseInt(params.get("sellerId")) || 0;
  const userId    = parseInt(localStorage.getItem("userId"));

  const transaction = {
    listingId:  listingId,
    buyerId:    userId,
    sellerId:   sellerId,
    amount:     totalPrice - 5,   // amount before service fee
    pspType:    currentMethod === "card" ? "credit_card" : currentMethod
  };

  createTransaction(
    transaction,
    function () {
      document.getElementById("successOverlay").style.display = "flex";
    },
    function () {
      btn.innerHTML = "שגיאה בתשלום — נסה שנית";
      btn.style.opacity = "1";
      btn.disabled = false;
    }
  );
}
