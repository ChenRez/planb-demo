/* sellerProfilePage.js — לוגיקת מסך פרופיל מוכר */

$(document).ready(function () {
  var params   = new URLSearchParams(window.location.search);
  var sellerId = params.get("id");
  if (!sellerId) return;

  var defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200";

  ajaxCall("GET", "/api/users/" + sellerId, null,
    function (user) {
      var name = (user.firstName || "") + " " + (user.lastName || "");
      document.getElementById("spName").innerText     = name.trim() || "מוכר";
      document.getElementById("spChatName").innerText = "שלח הודעה ל" + (user.firstName || "מוכר");
      document.getElementById("spSectionTitle").innerText = "עוד מכירות של " + (user.firstName || "המוכר");

      var year = user.createdAt ? new Date(user.createdAt).getFullYear() : "";
      document.getElementById("spMeta").innerText = year ? "חבר/ה ב-PlanB מאז " + year : "";

      var avatar = document.getElementById("spAvatar");
      avatar.src    = mediaUrl(user.avatarUrl) || defaultAvatar;
      avatar.onerror = function () { this.src = defaultAvatar; this.onerror = null; };

      if (user.trustScore != null) {
        document.getElementById("spScore").innerText = parseFloat(user.trustScore).toFixed(1);
      }
    },
    function () {}
  );

  ajaxCall("GET", "/api/listings/by-seller/" + sellerId, null,
    function (listings) {
      var active = listings.filter(function (l) { return l.status !== "Suspended"; });
      var container = document.getElementById("spListingsContainer");
      container.innerHTML = "";

      if (!active || active.length === 0) {
        container.innerHTML = "<p style='text-align:center;color:#999;padding:10px;'>אין מכירות פעילות</p>";
        return;
      }

      active.forEach(function (l) {
        var img = escapeHtml(mediaUrl(l.imagePath) || "pic/default.jpg");
        var title = escapeHtml(l.title);
        var loc = escapeHtml(l.location || "");
        container.innerHTML +=
          '<div onclick="window.location.href=\'productDetails.html?id=' + l.listingId + '\'" style="background:white;border-radius:16px;padding:10px;display:flex;gap:10px;align-items:center;margin-bottom:10px;box-shadow:0 2px 5px rgba(0,0,0,0.05);cursor:pointer;">' +
            '<img src="' + img + '" style="width:60px;height:60px;border-radius:10px;object-fit:cover;" onerror="this.src=\'pic/default.jpg\'">' +
            '<div style="flex:1">' +
              '<div style="font-weight:700;font-size:14px;">' + title + '</div>' +
              '<div style="font-size:12px;color:#999;">' + (l.quantity || 1) + ' כרטיסים' + (l.location ? ' • ' + loc : '') + '</div>' +
            '</div>' +
            '<div style="font-weight:800;color:#ff4757;">' + l.priceRequested + '₪</div>' +
          '</div>';
      });
    },
    function () {}
  );
});
