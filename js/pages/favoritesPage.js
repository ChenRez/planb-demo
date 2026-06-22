/* favoritesPage.js — דף מועדפים */

$(document).ready(function () {
  if (!requireAuth()) return;
  var userId = localStorage.getItem("userId");
  loadFavorites(userId);
});

function loadFavorites(userId) {
  ajaxCall("GET", "/api/favorites/" + userId, null, loadFavSuccess, loadFavError);
}

function loadFavSuccess(data) {
  var container = document.getElementById("favList");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#999; margin-top:30px;'>אין מועדפים עדיין</p>";
    return;
  }

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var img = escapeHtml(mediaUrl(item.imagePath) || fallbackImg());
    var date = new Date(item.eventDate).toLocaleDateString('he-IL');
    var loc = escapeHtml(item.location || '');
    var title = escapeHtml(item.listingTitle || '');

    container.innerHTML +=
      '<div class="fav-item" onclick="window.location.href=\'productDetails.html?id=' + item.listingId + '\'">' +
        '<img src="' + img + '" class="fav-img">' +
        '<div class="fav-content">' +
          '<span class="fav-title">' + title + '</span>' +
          '<span class="fav-sub">' + date + ' | ' + loc + '</span>' +
          '<div class="fav-price">' + item.priceRequested + '₪ <span style="font-size:10px;font-weight:500;opacity:.7;">לכרטיס</span></div>' +
        '</div>' +
        '<div class="remove-btn" onclick="removeFav(event, ' + item.listingId + ')"><i class="fas fa-times"></i></div>' +
      '</div>';
  }
}

function removeFav(event, listingId) {
  event.stopPropagation();
  var userId = localStorage.getItem("userId");
  ajaxCall("DELETE", "/api/favorites/" + userId + "/" + listingId, null, removeFavSuccess, removeFavError);
}

function removeFavSuccess() {
  var userId = localStorage.getItem("userId");
  if (typeof showToast === "function") showToast("הוסר מהמועדפים");
  loadFavorites(userId);
}

function removeFavError(err) {
  if (typeof showToast === "function") showToast("שגיאה בהסרה מהמועדפים");
  console.error("שגיאה בהסרה:", err);
}

function loadFavError(err) {
  console.error("שגיאה בטעינת מועדפים:", err);
}
