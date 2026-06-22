/* adminUsersPage.js — ניהול משתמשים */

var allUsers   = [];
var activeFilter = 'הכל';

$(document).ready(function () {
  ajaxCall("GET", "/api/admin/users?adminId=" + localStorage.getItem("userId"), null, loadUsersSuccess, loadUsersError);

  $(".admin-chip").on("click", function () {
    $(".admin-chip").removeClass("active");
    $(this).addClass("active");
    activeFilter = $(this).text().trim();
    renderUsers();
  });
});

function loadUsersSuccess(data) {
  allUsers = data;
  renderUsers();
}

function loadUsersError(err) {
  document.querySelector(".admin-users-list").innerHTML =
    "<p style='text-align:center;color:#999;padding:20px;'>שגיאה בטעינת משתמשים</p>";
  console.error("שגיאה:", err);
}

function renderUsers() {
  var container = document.querySelector(".admin-users-list");
  container.innerHTML = "";

  var filtered = allUsers.filter(function (u) {
    if (activeFilter === 'הכל')   return true;
    if (activeFilter === 'פעילים') return u.status === 'active';
    if (activeFilter === 'חסומים') return u.status === 'suspended' || u.status === 'blocked' || u.status === 'reported';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:#999;padding:20px;'>אין משתמשים</p>";
    return;
  }

  var defaultAvatar = (typeof avatarFallback === "function") ? avatarFallback() : "../pic/avatar-default.svg";

  filtered.forEach(function (u) {
    var name       = (u.firstName || "") + " " + (u.lastName || "");
    var avatar     = mediaUrl(u.avatarUrl) || defaultAvatar;
    var statusText = 'חסום';
    var badgeClass = 'status-suspended';

    if (u.status === 'active') {
      statusText = 'פעיל';
      badgeClass = 'status-active';
    } else if (u.status === 'reported') {
      statusText = 'מדווח';
      badgeClass = 'status-flagged';
    }

    container.innerHTML +=
      '<a href="admin-user-details.html?userId=' + u.userId + '" class="admin-user-card">' +
        '<img src="' + avatar + '" class="admin-avatar" onerror="this.src=\'' + defaultAvatar + '\'">' +
        '<div class="admin-user-info">' +
          '<div class="admin-user-name">' + name.trim() + '</div>' +
          '<div class="admin-user-meta">' + (u.email || '') + '</div>' +
          '<div class="admin-user-meta">' + (u.city || '') + ' | ' + (u.role === 'admin' ? 'אדמין' : 'משתמש') + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">' +
          '<span class="admin-status-badge ' + badgeClass + '">' + statusText + '</span>' +
          '<i class="fas fa-chevron-left" style="color:#ccc;font-size:12px;"></i>' +
        '</div>' +
      '</a>';
  });
}
