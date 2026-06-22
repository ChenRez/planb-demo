/* adminListingDetailsPage.js — פרטי מודעה (אדמין) */

function viewTicket() { showToast("פותח קובץ כרטיס (דמה)..."); }
function saveQuickEdit() { showToast("השינויים נשמרו בהצלחה."); }

function openReuploadModal()   { document.getElementById("reuploadModal").style.display = "flex"; }
function closeReuploadModal()  { document.getElementById("reuploadModal").style.display = "none"; }
function sendReuploadRequest() { closeReuploadModal(); showToast("נשלחה בקשה להעלאה מחדש."); }

let isSuspended = false;

function applyStatusBadge(status) {
  const badge = document.getElementById("listingStatusBadge");
  if (!badge) return;
  let cls = "status-active", txt = "פעיל";
  if (status === "Suspended")    { cls = "status-suspended"; txt = "בהשעיה"; }
  else if (status === "Sold")    { cls = "status-completed"; txt = "נמכר"; }
  else if (status === "Expired") { cls = "status-suspended"; txt = "פג תוקף"; }
  badge.className = "admin-status-badge " + cls;
  badge.innerText = txt;
}

function applySuspendBtn() {
  const btn = document.getElementById("suspendBtn");
  if (!btn) return;
  const iconSpan = btn.querySelector(".material-symbols-rounded");
  const textSpan = btn.querySelector("span:last-child");
  if (isSuspended) {
    btn.className = "admin-btn-action btn-restore";
    if (iconSpan) iconSpan.innerText = "restore";
    if (textSpan) textSpan.innerText = "שחזור פרסום";
  } else {
    btn.className = "admin-btn-action btn-suspend";
    if (iconSpan) iconSpan.innerText = "pause_circle";
    if (textSpan) textSpan.innerText = "השעיית פרסום";
  }
}

function toggleSuspend() {
  const newStatus = isSuspended ? "Public" : "Suspended";
  ajaxCall("PUT", "/api/admin/listings/" + _listingId + "/status?adminId=" + localStorage.getItem("userId"), { status: newStatus },
    function () {
      isSuspended = !isSuspended;
      applySuspendBtn();
      applyStatusBadge(newStatus);
      showToast(isSuspended ? "הפרסום הושעה." : "הפרסום שוחזר.");
    },
    function () { showToast("שגיאה בעדכון סטטוס הפרסום."); }
  );
}

function removeFakeSections() {
  // עריכה מהירה (כרטיס שני) — אין endpoint עריכה
  const quick = document.getElementById("quickTitle");
  if (quick) {
    const card = quick.closest(".admin-info-card");
    if (card) {
      if (card.previousElementSibling) card.previousElementSibling.remove();
      card.remove();
    }
  }
  // קובץ הכרטיס — צפייה מוגבלת לקונה, אין "בקשת העלאה"
  const fileBox = document.querySelector(".admin-file-box");
  if (fileBox) {
    if (fileBox.previousElementSibling) fileBox.previousElementSibling.remove();
    fileBox.remove();
  }
  // היסטוריית דיווחים — אין טבלת דיווחים במערכת
  const reports = document.querySelector(".admin-reports-list");
  if (reports) {
    if (reports.previousElementSibling) reports.previousElementSibling.remove();
    reports.remove();
  }
  // הערה פנימית + צ'אט עם המוכר — אין backend
  const note = document.querySelector(".admin-audit-textarea");
  if (note) {
    const grp = note.closest(".admin-form-group");
    if (grp) grp.remove();
  }
  const chatBtn = document.querySelector(".btn-chat");
  if (chatBtn) chatBtn.remove();
}

function loadListingDetails() {
  if (!_listingId) { showToast("מזהה פרסום חסר."); return; }

  ajaxCall("GET", "/api/listings/" + _listingId, null,
    function (l) {
      const banner = document.querySelector(".admin-event-banner");
      if (banner) {
        const url = (typeof mediaUrl === "function") ? mediaUrl(l.imagePath) : l.imagePath;
        if (url) banner.src = url;
      }
      const titleEl = document.querySelector(".admin-event-title");
      if (titleEl) titleEl.textContent = l.title || "";

      const meta = document.querySelector(".admin-event-meta");
      if (meta) {
        meta.innerHTML =
          '<span><i class="fas fa-tag"></i> ' + escapeHtml(l.categoryName || "") + '</span>' +
          '<span><i class="fas fa-ticket-alt"></i> ' + (l.quantity || 1) + ' כרטיסים</span>';
      }

      const price = document.querySelector(".admin-price-badge");
      if (price) price.textContent = "₪" + l.priceRequested;

      applyStatusBadge(l.status);
      isSuspended = (l.status === "Suspended");
      applySuspendBtn();

      const sellerName = document.querySelector(".admin-seller-name");
      if (sellerName) sellerName.textContent = l.sellerName || ("מוכר #" + l.sellerId);
      const sellerAvatar = document.querySelector(".admin-seller-avatar");
      if (sellerAvatar) {
        const url = (typeof mediaUrl === "function") ? mediaUrl(l.sellerAvatarUrl) : l.sellerAvatarUrl;
        if (url) sellerAvatar.src = url;
      }
      const sellerLink = document.querySelector(".admin-seller-info");
      if (sellerLink) sellerLink.href = "admin-user-details.html?userId=" + l.sellerId;
    },
    function () { showToast("שגיאה בטעינת פרטי הפרסום."); }
  );

  removeFakeSections();
}

document.addEventListener("DOMContentLoaded", loadListingDetails);

var _listingId = new URLSearchParams(window.location.search).get("id");

function openDeleteModal()  { document.getElementById("deleteModal").style.display = "flex"; }
function closeDeleteModal() { document.getElementById("deleteModal").style.display = "none"; }
function confirmDelete() {
  ajaxCall("DELETE", "/api/admin/listings/" + _listingId + "?adminId=" + localStorage.getItem("userId"), null,
    function () { showToast("הפרסום נמחק בהצלחה"); setTimeout(() => { window.location.href = "admin-listings.html"; }, 1500); },
    function () { showToast("שגיאה במחיקת הפרסום."); closeDeleteModal(); }
  );
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg; toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
