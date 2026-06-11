/* adminUserDetailsPage.js — פרטי משתמש (אדמין) */

const params = new URLSearchParams(window.location.search);
const adminUserId = params.get("userId");

function toggleFlagOtherInput() {
  const select = document.getElementById("userFlagSelect");
  const input  = document.getElementById("flagOtherInput");
  input.style.display = select.value === "other" ? "block" : "none";
}

function saveInternalNote() { showToast("ההערה נשמרה."); }

let isBlocked = false;

function openBlockModal() {
  if (isBlocked) {
    ajaxCall("PUT", "/api/admin/users/" + adminUserId + "/status", { status: "active" },
      function () { isBlocked = false; updateBlockUI(); showToast("החסימה בוטלה."); },
      function () { showToast("שגיאה בביטול החסימה."); }
    );
  } else {
    document.getElementById("blockModal").style.display = "flex";
  }
}
function closeBlockModal() { document.getElementById("blockModal").style.display = "none"; }
function confirmBlock() {
  ajaxCall("PUT", "/api/admin/users/" + adminUserId + "/status", { status: "suspended" },
    function () { isBlocked = true; closeBlockModal(); updateBlockUI(); showToast("המשתמש נחסם."); },
    function () { showToast("שגיאה בחסימת המשתמש."); }
  );
}

function updateBlockUI() {
  const btn      = document.getElementById("blockBtn");
  const badge    = document.getElementById("userStatusBadge");
  const iconSpan = btn.querySelector(".material-symbols-rounded");
  const textSpan = btn.querySelector("span:last-child");
  if (isBlocked) {
    btn.className = "admin-btn-action btn-unblock"; iconSpan.innerText = "check_circle"; textSpan.innerText = "ביטול חסימה";
    badge.className = "admin-badge-lg badge-blocked"; badge.innerText = "חסום";
  } else {
    btn.className = "admin-btn-action btn-block"; iconSpan.innerText = "block"; textSpan.innerText = "חסימת משתמש";
    badge.className = "admin-badge-lg badge-active"; badge.innerText = "פעיל";
  }
}

function openDeleteModal()  { document.getElementById("deleteModal").style.display = "flex"; }
function closeDeleteModal() { document.getElementById("deleteModal").style.display = "none"; }
function confirmDelete() {
  ajaxCall("DELETE", "/api/admin/users/" + adminUserId, null,
    function () { closeDeleteModal(); showToast("המשתמש הוסר מהמערכת."); setTimeout(() => { window.location.href = "admin-users.html"; }, 1500); },
    function () { showToast("שגיאה בהסרת המשתמש."); closeDeleteModal(); }
  );
}

function toggleReasonInput(type) {
  const selectId = type === "block" ? "blockReason" : "deleteReason";
  const inputId  = type === "block" ? "blockOtherInput" : "deleteOtherInput";
  document.getElementById(inputId).style.display = document.getElementById(selectId).value === "other" ? "block" : "none";
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg; toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
