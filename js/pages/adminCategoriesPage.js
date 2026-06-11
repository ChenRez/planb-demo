/* adminCategoriesPage.js — ניהול קטגוריות */

function openEditModal(name) {
  document.getElementById("modalTitle").innerText = "עריכת קטגוריה";
  document.getElementById("catNameInput").value = name;
  document.getElementById("modalStatusToggle").checked = true;
  document.getElementById("modalHomeToggle").checked = true;
  document.getElementById("catModal").style.display = "flex";
}

function openAddModal() {
  document.getElementById("modalTitle").innerText = "הוספת קטגוריה חדשה";
  document.getElementById("catNameInput").value = "";
  document.getElementById("modalStatusToggle").checked = true;
  document.getElementById("modalHomeToggle").checked = false;
  document.getElementById("catModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("catModal").style.display = "none";
}

function saveCategory() {
  closeModal();
  const title = document.getElementById("modalTitle").innerText;
  showToast(title.includes("הוספת") ? "הקטגוריה נוספה בהצלחה." : "הקטגוריה עודכנה.");
}

function moveUp(btn) {
  const card = btn.closest(".admin-cat-card");
  const prev = card.previousElementSibling;
  if (prev) { card.parentNode.insertBefore(card, prev); renumber(); showToast("סדר הקטגוריות עודכן."); }
}

function moveDown(btn) {
  const card = btn.closest(".admin-cat-card");
  const next = card.nextElementSibling;
  if (next) { card.parentNode.insertBefore(next, card); renumber(); showToast("סדר הקטגוריות עודכן."); }
}

function renumber() {
  document.querySelectorAll(".admin-order-num").forEach((span, i) => { span.innerText = i + 1; });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
