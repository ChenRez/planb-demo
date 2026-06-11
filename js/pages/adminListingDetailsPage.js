/* adminListingDetailsPage.js — פרטי מודעה (אדמין) */

function viewTicket() { alert("פותח קובץ כרטיס (דמה)..."); }
function saveQuickEdit() { showToast("השינויים נשמרו בהצלחה."); }

function openReuploadModal()   { document.getElementById("reuploadModal").style.display = "flex"; }
function closeReuploadModal()  { document.getElementById("reuploadModal").style.display = "none"; }
function sendReuploadRequest() { closeReuploadModal(); showToast("נשלחה בקשה להעלאה מחדש."); }

let isSuspended = false;
function toggleSuspend() {
  isSuspended = !isSuspended;
  const btn      = document.getElementById("suspendBtn");
  const badge    = document.getElementById("listingStatusBadge");
  const iconSpan = btn.querySelector(".material-symbols-rounded");
  const textSpan = btn.querySelector("span:last-child");
  if (isSuspended) {
    btn.className = "admin-btn-action btn-restore"; iconSpan.innerText = "restore"; textSpan.innerText = "שחזור פרסום";
    badge.className = "admin-status-badge status-suspended"; badge.innerText = "בהשעיה"; showToast("הפרסום הושעה.");
  } else {
    btn.className = "admin-btn-action btn-suspend"; iconSpan.innerText = "pause_circle"; textSpan.innerText = "השעיית פרסום";
    badge.className = "admin-status-badge status-reported"; badge.innerText = "מדווח"; showToast("הפרסום שוחזר.");
  }
}

var _listingId = new URLSearchParams(window.location.search).get("id");

function openDeleteModal()  { document.getElementById("deleteModal").style.display = "flex"; }
function closeDeleteModal() { document.getElementById("deleteModal").style.display = "none"; }
function confirmDelete() {
  ajaxCall("DELETE", "/api/admin/listings/" + _listingId, null,
    function () { showToast("הפרסום נמחק בהצלחה"); setTimeout(() => { window.location.href = "admin-listings.html"; }, 1500); },
    function () { showToast("שגיאה במחיקת הפרסום."); closeDeleteModal(); }
  );
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg; toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
