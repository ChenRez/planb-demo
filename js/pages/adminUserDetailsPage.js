/* adminUserDetailsPage.js — פרטי משתמש (אדמין) */

const params = new URLSearchParams(window.location.search);
const adminUserId = params.get("userId");

function formatJoinDate(dateStr) {
  if (!dateStr) return "";
  const d  = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return "הצטרף/ה ב-" + dd + "/" + mm + "/" + d.getFullYear();
}

const ADMIN_PUR_STATUS = {
  Completed: { text: "הושלם", cls: "badge-done" },
  Pending:   { text: "ממתין", cls: "badge-wait" },
  Failed:    { text: "נכשל",  cls: "badge-wait" },
  Refunded:  { text: "הוחזר", cls: "badge-wait" }
};

function buildAdminPurchaseItem(tx) {
  const st    = ADMIN_PUR_STATUS[tx.status] || { text: tx.status, cls: "badge-wait" };
  const title = tx.listingTitle || ("רכישה #" + tx.transactionId);
  const date  = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("he-IL") : "";
  const div   = document.createElement("div");
  div.className = "admin-purchase-item";
  div.innerHTML =
    '<div class="admin-pur-icon"><i class="fas fa-ticket-alt"></i></div>' +
    '<div class="admin-pur-details">' +
      '<div class="admin-pur-title">' + escapeHtml(title) + '</div>' +
      '<div class="admin-pur-date">' + escapeHtml(date) + '</div>' +
    '</div>' +
    '<div class="admin-pur-right">' +
      '<div class="admin-pur-price">' + (tx.totalAmount || 0) + '₪</div>' +
      '<div class="admin-pur-badge ' + st.cls + '">' + st.text + '</div>' +
    '</div>';
  return div;
}

function loadUserDetails() {
  if (!adminUserId) { showToast("מזהה משתמש חסר."); return; }

  ajaxCall("GET", "/api/users/" + adminUserId, null,
    function (u) {
      const fullName = ((u.firstName || "") + " " + (u.lastName || "")).trim();
      document.getElementById("userName").textContent     = fullName || "משתמש";
      document.getElementById("userEmail").textContent    = u.email || "";
      document.getElementById("userJoinDate").textContent = formatJoinDate(u.createdAt);
      document.getElementById("userSales").textContent     = u.totalSales || 0;
      document.getElementById("userPurchases").textContent = u.totalPurchases || 0;
      document.getElementById("userTrust").textContent     = (u.trustScore != null ? u.trustScore : 0).toFixed(1);

      const avatar = document.querySelector(".admin-profile-img");
      if (avatar) {
        const url = (typeof mediaUrl === "function") ? mediaUrl(u.avatarUrl) : u.avatarUrl;
        if (url) avatar.src = url;
      }

      isBlocked = (u.status !== "active");
      updateBlockUI();
    },
    function () { showToast("שגיאה בטעינת פרטי המשתמש."); }
  );

  ajaxCall("GET", "/api/transactions/by-buyer/" + adminUserId, null,
    function (txs) {
      const list = document.getElementById("userPurchaseList");
      list.innerHTML = "";
      if (!txs || txs.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:14px;">אין רכישות</p>';
        return;
      }
      txs.forEach(function (tx) { list.appendChild(buildAdminPurchaseItem(tx)); });
    },
    function () {
      document.getElementById("userPurchaseList").innerHTML =
        '<p style="text-align:center;color:#999;padding:14px;">שגיאה בטעינת היסטוריית הרכישות</p>';
    }
  );

  // הסרת מקטעים מדומים שאין להם backend (פסי דירוג משנה, הערות פנימיות, צ'אט תמיכה)
  document.querySelectorAll(".admin-rating-row").forEach(function (r) { r.remove(); });
  const notes = document.querySelector(".admin-notes-wrapper");
  if (notes) {
    if (notes.previousElementSibling) notes.previousElementSibling.remove();
    notes.remove();
  }
  const chatBtn = document.querySelector(".btn-chat");
  if (chatBtn) chatBtn.remove();
}

document.addEventListener("DOMContentLoaded", loadUserDetails);

function toggleFlagOtherInput() {
  const select = document.getElementById("userFlagSelect");
  const input  = document.getElementById("flagOtherInput");
  input.style.display = select.value === "other" ? "block" : "none";
}

function saveInternalNote() { showToast("ההערה נשמרה."); }

let isBlocked = false;

function openBlockModal() {
  if (isBlocked) {
    ajaxCall("PUT", "/api/admin/users/" + adminUserId + "/status?adminId=" + localStorage.getItem("userId"), { status: "active" },
      function () { isBlocked = false; updateBlockUI(); showToast("החסימה בוטלה."); },
      function () { showToast("שגיאה בביטול החסימה."); }
    );
  } else {
    document.getElementById("blockModal").style.display = "flex";
  }
}
function closeBlockModal() { document.getElementById("blockModal").style.display = "none"; }
function confirmBlock() {
  ajaxCall("PUT", "/api/admin/users/" + adminUserId + "/status?adminId=" + localStorage.getItem("userId"), { status: "suspended" },
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
  ajaxCall("DELETE", "/api/admin/users/" + adminUserId + "?adminId=" + localStorage.getItem("userId"), null,
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
