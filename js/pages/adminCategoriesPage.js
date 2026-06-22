/* adminCategoriesPage.js — ניהול קטגוריות */

let _editingCatId = null;
let _cats = [];

function loadCategories() {
  ajaxCall("GET", "/api/categories", null,
    function (cats) { _cats = cats || []; renderCategories(); },
    function () { showToast("שגיאה בטעינת הקטגוריות."); }
  );
}

function renderCategories() {
  const $list = $("#catList");
  $list.empty();

  if (!_cats.length) {
    $list.html("<p style='text-align:center;color:#999;padding:20px;'>אין קטגוריות</p>");
    return;
  }

  _cats.forEach(function (c, i) {
    const active = c.isActive;
    const badgeCls = active ? "status-active" : "status-hidden";
    const badgeTxt = active ? "פעילה" : "מוסתרת";

    const $card = $(
      '<div class="admin-cat-card">' +
        '<div class="admin-cat-header">' +
          '<div class="admin-cat-start">' +
            '<span class="admin-order-num">' + (i + 1) + '</span>' +
            '<div class="admin-cat-icon">' + categoryIconHtml(c.categoryId) + '</div>' +
            '<div class="admin-cat-name"></div>' +
          '</div>' +
          '<div class="admin-status-badge ' + badgeCls + '">' + badgeTxt + '</div>' +
        '</div>' +
        '<span class="admin-help-text">קטגוריות אינן נמחקות לצמיתות — ניתן רק להסתיר.</span>' +
        '<div class="admin-cat-actions">' +
          '<div class="admin-toggle-wrap">' +
            '<span>סטטוס פעיל</span>' +
            '<label class="switch"><input type="checkbox" class="cat-active-toggle"' +
              (active ? " checked" : "") + ' /><span class="slider"></span></label>' +
          '</div>' +
          '<div class="admin-actions-left">' +
            '<button class="admin-btn-edit"><i class="fas fa-pencil-alt"></i> עריכה</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    $card.find(".admin-cat-name").text(c.name);
    $card.find(".cat-active-toggle").on("change", function () {
      toggleActive(c.categoryId, this.checked);
    });
    $card.find(".admin-btn-edit").on("click", function () {
      openEditModal(c.categoryId, c.name, active);
    });

    $list.append($card);
  });
}

function openEditModal(id, name, isActive) {
  _editingCatId = id;
  document.getElementById("modalTitle").innerText = "עריכת קטגוריה";
  document.getElementById("catNameInput").value = name;
  document.getElementById("modalStatusToggle").checked = isActive;
  document.getElementById("catModal").style.display = "flex";
}

function openAddModal() {
  _editingCatId = null;
  document.getElementById("modalTitle").innerText = "הוספת קטגוריה חדשה";
  document.getElementById("catNameInput").value = "";
  document.getElementById("modalStatusToggle").checked = true;
  document.getElementById("catModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("catModal").style.display = "none";
}

function saveCategory() {
  const name = document.getElementById("catNameInput").value.trim();
  const isActive = document.getElementById("modalStatusToggle").checked;
  if (!name) { showToast("יש להזין שם קטגוריה."); return; }

  const okAdd = function () { closeModal(); showToast("הקטגוריה נוספה בהצלחה."); loadCategories(); };
  const okUpd = function () { closeModal(); showToast("הקטגוריה עודכנה."); loadCategories(); };
  const fail  = function (err) {
    showToast(err && err.status === 409 ? "קטגוריה עם שם זה כבר קיימת." : "שגיאה בשמירת הקטגוריה.");
  };

  if (_editingCatId === null) {
    ajaxCall("POST", "/api/categories?adminId=" + localStorage.getItem("userId"), { name: name, isActive: isActive }, okAdd, fail);
  } else {
    ajaxCall("PUT", "/api/categories/" + _editingCatId + "?adminId=" + localStorage.getItem("userId"), { name: name, isActive: isActive }, okUpd, fail);
  }
}

function toggleActive(id, isActive) {
  ajaxCall("PUT", "/api/categories/" + id + "/active?adminId=" + localStorage.getItem("userId"), { isActive: isActive },
    function () {
      const c = _cats.find(function (x) { return x.categoryId === id; });
      if (c) c.isActive = isActive;
      renderCategories();
      showToast(isActive ? "הקטגוריה הופעלה." : "הקטגוריה הוסתרה.");
    },
    function () { showToast("שגיאה בעדכון הסטטוס."); loadCategories(); }
  );
}

$(document).ready(loadCategories);

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
