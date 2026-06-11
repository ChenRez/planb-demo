/* adminListingsPage.js — ניהול פרסומים */

var allAdminListings = [];
var activeFilter = 'הכל';

$(document).ready(function () {
  ajaxCall("GET", "/api/listings", null, loadAdminListingsSuccess, loadAdminListingsError);

  $(".admin-chip").on("click", function () {
    $(".admin-chip").removeClass("active");
    $(this).addClass("active");
    activeFilter = $(this).text().trim();
    renderAdminListings();
  });
});

function loadAdminListingsSuccess(data) {
  allAdminListings = data;
  renderAdminListings();
}

function renderAdminListings() {
  var container = document.getElementById("adminListingsList");
  container.innerHTML = "";

  var filtered = [];
  for (var i = 0; i < allAdminListings.length; i++) {
    var item = allAdminListings[i];
    var badgeText = 'פעיל';
    if (item.status === 'Suspended') badgeText = 'בהשעיה';
    if (item.status === 'Sold') badgeText = 'הושלם';

    if (activeFilter === 'הכל' || activeFilter === badgeText) {
      filtered.push(item);
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#999;'>אין פרסומים</p>";
    return;
  }

  for (var i = 0; i < filtered.length; i++) {
    var item = filtered[i];
    var img = mediaUrl(item.imagePath) || 'pic/default.jpg';
    var cat = item.categoryName || '';
    var price = item.priceRequested;

    var badgeClass = 'status-active';
    var badgeText = 'פעיל';
    if (item.status === 'Suspended') { badgeClass = 'status-suspended'; badgeText = 'בהשעיה'; }
    if (item.status === 'Sold')      { badgeClass = 'status-completed'; badgeText = 'הושלם'; }

    container.innerHTML +=
      '<a href="admin-listing-details.html?id=' + item.listingId + '" class="admin-listing-card">' +
        '<img src="' + img + '" class="admin-listing-img">' +
        '<div class="admin-listing-info">' +
          '<div class="admin-listing-title">' + item.title + '</div>' +
          '<div class="admin-listing-meta">' + cat + ' | ' + item.quantity + ' כרטיסים | ₪' + price + '</div>' +
          '<div class="admin-status-badge ' + badgeClass + '">' + badgeText + '</div>' +
        '</div>' +
        '<i class="fas fa-chevron-left admin-chevron"></i>' +
      '</a>';
  }
}

function loadAdminListingsError(err) {
  console.error("שגיאה בטעינת פרסומים:", err);
}
