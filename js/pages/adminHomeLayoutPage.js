/* adminHomeLayoutPage.js — עריכת פריסת דף הבית */

function openEditModal(name) {
  document.getElementById("modalTitle").innerText = "עריכת אזור";
  document.getElementById("sectionNameInput").value = name;
  const select = document.getElementById("sectionTypeSelect");
  if (name.includes("קטגוריות")) select.value = "categories";
  else if (name.includes("מותאם")) select.value = "custom";
  else select.value = "cards";
  document.getElementById("layoutModal").style.display = "flex";
}

function openAddModal() {
  document.getElementById("modalTitle").innerText = "הוספת אזור חדש";
  document.getElementById("sectionNameInput").value = "";
  document.getElementById("layoutModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("layoutModal").style.display = "none";
}

function saveSection() {
  closeModal();
  const title = document.getElementById("modalTitle").innerText;
  showToast(title.includes("הוספת") ? "האזור נוסף לדף הבית." : "האזורים עודכנו.");
}

function step(amount) {
  const el = document.getElementById("stepVal");
  let val = Math.min(20, Math.max(1, parseInt(el.innerText) + amount));
  el.innerText = val;
}

function toggleSection(checkbox) {
  const card  = checkbox.closest(".admin-section-card");
  const badge = card.querySelector(".admin-status-badge");
  if (checkbox.checked) {
    card.classList.remove("disabled-mode");
    badge.classList.replace("status-off", "status-on");
    badge.innerText = "פעיל";
  } else {
    card.classList.add("disabled-mode");
    badge.classList.replace("status-on", "status-off");
    badge.innerText = "כבוי";
  }
  updatePreviewText();
}

function moveUp(btn) {
  const card = btn.closest(".admin-section-card");
  const prev = card.previousElementSibling;
  if (prev) { card.parentNode.insertBefore(card, prev); updatePreviewText(); }
}

function moveDown(btn) {
  const card = btn.closest(".admin-section-card");
  const next = card.nextElementSibling;
  if (next) { card.parentNode.insertBefore(next, card); updatePreviewText(); }
}

function updatePreviewText() {
  const list = document.getElementById("sectionsList");
  const previewList = document.getElementById("previewList");
  previewList.innerHTML = "";
  list.querySelectorAll(".admin-section-card").forEach((card) => {
    if (!card.classList.contains("disabled-mode")) {
      const item = document.createElement("div");
      item.className = "admin-preview-item";
      item.innerText = card.querySelector(".admin-card-title").innerText;
      previewList.appendChild(item);
    }
  });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
