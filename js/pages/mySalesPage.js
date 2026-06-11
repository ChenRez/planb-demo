/* mySalesPage.js — המכירות שלי */

$(document).ready(function () {
  if (!requireAuth()) return;
  var sellerId = localStorage.getItem("userId");
  ajaxCall("GET", "/api/listings/by-seller/" + sellerId, null, loadSalesSuccess, loadSalesError);
});

function loadSalesSuccess(data) {
  var container = document.getElementById("salesList");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p style='text-align:center; color:#999;'>אין מכירות עדיין</p>";
    return;
  }

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var img = escapeHtml(mediaUrl(item.imagePath) || 'pic/default.jpg');
    var title = escapeHtml(item.title);
    var statusMap = { Public: 'באוויר', Highlighted: 'מומלץ', Price_Drop: 'הנחה', Suspended: 'הוסר', Sold: 'נמכר' };
    var status = statusMap[item.status] || item.status;
    var badgeClass = item.status === 'Public' || item.status === 'Highlighted' ? 'active' : 'completed';
    var date = new Date(item.createdAt).toLocaleDateString('he-IL');

    container.innerHTML +=
      '<div class="sale-item" id="sale-' + item.listingId + '" onclick="window.location.href=\'productDetails.html?id=' + item.listingId + '\'">' +
        '<div class="sale-img-wrap"><img src="' + img + '" class="sale-thumb"></div>' +
        '<div class="sale-info">' +
          '<span class="sale-title">' + title + '</span>' +
          '<div class="sale-meta"><i class="far fa-clock"></i> ' + date + '</div>' +
        '</div>' +
        '<div class="sale-status-col">' +
          '<div class="sale-price">' + item.priceRequested + '\u20AA</div>' +
          '<span class="status-badge ' + badgeClass + '">' + status + '</span>' +
          '<button class="sale-delete-btn" onclick="deleteListing(event,' + item.listingId + ')" title="מחק פרסום">&#x1F5D1;</button>' +
        '</div>' +
      '</div>';
  }
}

function loadSalesError(err) {
  console.error("שגיאה בטעינת מכירות:", err);
}

function deleteListing(event, listingId) {
  event.stopPropagation();
  if (!confirm("להסיר את הפרסום מהמכירות שלך?")) return;
  var userId = localStorage.getItem("userId");
  ajaxCall("DELETE", "/api/listings/" + listingId + "?userId=" + userId, null,
    function () {
      var el = document.getElementById("sale-" + listingId);
      if (el) el.remove();
    },
    function (xhr) { alert((xhr.responseJSON && xhr.responseJSON.message) || "שגיאה במחיקת הפרסום"); }
  );
}
