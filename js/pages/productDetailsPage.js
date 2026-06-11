/* productDetailsPage.js — לוגיקת מסך פרטי מוצר */

/* --- בחירת כמות כרטיסים --- */
let currentQty = 1;
let maxQty = 1;
let currentSellerId = 0;

function updateQty(change) {
  let newQty = currentQty + change;
  if (newQty >= 1 && newQty <= maxQty) {
    currentQty = newQty;
    document.getElementById("qtyDisplay").innerText = currentQty;
  }
}

/* טעינת פרטי מוצר מהשרת */
$(document).ready(function () {
  var id = window.location.search.split("id=")[1];
  if (!id) { alert("לא נמצא מזהה פרסום"); return; }

  ajaxCall("GET", "/api/listings/" + id, null, loadProductSuccess, loadProductError);
});

function loadProductSuccess(item) {
  document.getElementById("pTitle").innerText = item.title;
  document.getElementById("pLoc").innerText = item.location || '';
  document.getElementById("pPrice").innerText = item.priceRequested + "₪";
  document.getElementById("pOldPrice").innerText = (item.priceOriginal || Math.round(item.priceRequested * 1.25)) + "₪";
  var pImg = document.getElementById("pImg");
  pImg.src = mediaUrl(item.imagePath) || 'pic/' + item.listingId + '.jpg';
  pImg.onerror = function() { this.src = 'pic/default.jpg'; this.onerror = null; };
  document.getElementById("pCat").innerText = item.categoryName || '';
  document.getElementById("pDesc").innerText = item.notes || '';

  var dateStr = new Date(item.eventDate).toLocaleDateString('he-IL');
  var dateParts = dateStr.split(".");
  if (dateParts.length >= 2) {
    document.getElementById("pDay").innerText = dateParts[0];
    document.getElementById("pMonth").innerText = "." + dateParts[1];
  } else {
    document.getElementById("pDay").innerText = dateStr;
    document.getElementById("pMonth").innerText = "";
  }

  currentSellerId = item.sellerId || 0;

  maxQty = item.quantity || 1;
  currentQty = 1;
  document.getElementById("qtyDisplay").innerText = currentQty;

  var splitSection = document.querySelector(".split-ticket-section");
  if (splitSection) {
    splitSection.style.display = (maxQty > 1 && item.splitMatchEnabled !== false && item.status !== "Sold") ? "block" : "none";
  }

  var buyBtn = document.querySelector(".buy-now-btn");
  if (buyBtn && item.status === "Sold") {
    buyBtn.innerText = "הצטרף לתור החכם";
    buyBtn.style.background = "linear-gradient(135deg,#636e72,#2d3436)";
    buyBtn.onclick = function () {
      var listingId = window.location.search.split("id=")[1] || "";
      var title     = document.getElementById("pTitle").innerText;
      window.location.href = "queue-purchase-window.html?listingId=" + listingId + "&itemName=" + encodeURIComponent(title);
    };
  }

  var defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
  var avatarEl = document.getElementById("sellerAvatar");
  avatarEl.src = mediaUrl(item.sellerAvatarUrl) || defaultAvatar;
  avatarEl.onerror = function() { this.src = defaultAvatar; this.onerror = null; };

  document.getElementById("sellerName").innerText = item.sellerName || "מוכר";
  document.getElementById("sellerScore").innerText = item.sellerTrustScore != null ? parseFloat(item.sellerTrustScore).toFixed(1) : "—";
  document.getElementById("sellerSales").innerText = item.sellerTotalSales ? "(" + item.sellerTotalSales + " עסקאות)" : "";

  document.getElementById("sellerLink").onclick = function() {
    window.location.href = "sellerProfile.html?id=" + item.sellerId;
  };

  var specsContainer = document.getElementById("dynamicSpecs");
  specsContainer.innerHTML = "";
  var specs = [
    { label: "כמות", val: item.quantity + " כרטיסים", icon: "confirmation_number" },
    { label: "סוג העברה", val: item.transferType, icon: "send_to_mobile" }
  ];
  if (item.sectorSeat) specs.push({ label: "מושב", val: item.sectorSeat, icon: "chair", highlight: true });
  if (item.homeGroup) specs.push({ label: "קבוצת בית", val: item.homeGroup, icon: "sports_soccer" });
  if (item.awayGroup) specs.push({ label: "קבוצת חוץ", val: item.awayGroup, icon: "sports_soccer" });

  for (var i = 0; i < specs.length; i++) {
    var spec = specs[i];
    var highlightClass = spec.highlight ? "highlight" : "";
    var iconColor = spec.highlight ? 'style="color:#f59e0b"' : "";
    specsContainer.innerHTML += '<div class="spec-item ' + highlightClass + '">' +
      '<span class="material-symbols-rounded" ' + iconColor + '>' + spec.icon + '</span>' +
      '<div class="spec-text">' +
        '<span class="spec-title">' + spec.label + '</span>' +
        '<span class="spec-val">' + escapeHtml(spec.val) + '</span>' +
      '</div></div>';
  }
}

function loadProductError(err) {
  alert("שגיאה בטעינת פרטי הפרסום");
  console.error("שגיאה:", err);
}

function goToChat() {
  var listingId  = window.location.search.split("id=")[1] || "";
  var title      = document.getElementById("pTitle").innerText;
  var sellerName = document.getElementById("sellerName").innerText;
  window.location.href = "chat.html"
    + "?listingId="  + listingId
    + "&receiverId=" + currentSellerId
    + "&sellerName=" + encodeURIComponent(sellerName)
    + "&title="      + encodeURIComponent(title);
}

function goToPayment() {
  var listingId = window.location.search.split("id=")[1] || "";
  var title = document.getElementById("pTitle").innerText;
  var priceText = document.getElementById("pPrice").innerText;
  window.location.href = "payment.html"
    + "?id="       + listingId
    + "&sellerId=" + currentSellerId
    + "&qty="      + currentQty
    + "&title="    + encodeURIComponent(title)
    + "&price="    + encodeURIComponent(priceText);
}

function toggleHeart(btn) {
  const icon = btn.querySelector("span");
  const userId = localStorage.getItem("userId");
  const listingId = window.location.search.split("id=")[1];
  if (!userId) { alert("יש להתחבר קודם"); return; }

  if (icon.innerText === "favorite_border") {
    icon.innerText = "favorite";
    icon.style.color = "#ff4757";
    ajaxCall("POST", "/api/favorites", { userId: parseInt(userId), listingId: parseInt(listingId) }, function(){}, function(){
      icon.innerText = "favorite_border";
      icon.style.color = "#2d3436";
      alert("שגיאה בעדכון המועדפים");
    });
  } else {
    icon.innerText = "favorite_border";
    icon.style.color = "#2d3436";
    ajaxCall("DELETE", "/api/favorites/" + userId + "/" + listingId, null, function(){}, function(){
      icon.innerText = "favorite";
      icon.style.color = "#ff4757";
      alert("שגיאה בעדכון המועדפים");
    });
  }
}

function shareItem() {
  if (navigator.share) {
    navigator.share({
      title: document.getElementById("pTitle").innerText,
      text: "תראו איזה כרטיס מצאתי ב-PlanB!",
      url: window.location.href,
    });
  } else {
    alert("הקישור הועתק!");
  }
}
