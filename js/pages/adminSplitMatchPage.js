/* adminSplitMatchPage.js — הגדרות פיצול-התאמה */

function toggleSettings() {
  const toggle    = document.getElementById("mainToggle");
  const container = document.getElementById("settingsContainer");
  const preview   = document.getElementById("previewCard");
  const enabled   = toggle.checked;
  container.classList.toggle("disabled", !enabled);
  preview.classList.toggle("disabled", !enabled);
  container.querySelectorAll("input").forEach((el) => (el.disabled = !enabled));
}

function updatePreview() {
  const maxBuyers  = parseInt(document.getElementById("maxBuyers").value);
  const previewText = document.getElementById("previewText");
  if      (maxBuyers >= 4) previewText.innerText = "1 + 1 + 1 + 1";
  else if (maxBuyers === 3) previewText.innerText = "2 + 1 + 1";
  else if (maxBuyers === 2) previewText.innerText = "2 + 2";
  else                      previewText.innerText = "4 (ללא פיצול)";
}

function toggleReasonInput() {
  const select = document.getElementById("changeReason");
  const input  = document.getElementById("otherReasonInput");
  input.style.display = select.value === "other" ? "block" : "none";
}

function openSaveModal()    { document.getElementById("saveModal").style.display = "flex"; }
function openExplainModal() { document.getElementById("explainModal").style.display = "flex"; }
function closeModals()      { document.getElementById("saveModal").style.display = "none"; document.getElementById("explainModal").style.display = "none"; }
function confirmSave()      { closeModals(); showToast("ההגדרות עודכנו בהצלחה."); }

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg; toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}

updatePreview();
