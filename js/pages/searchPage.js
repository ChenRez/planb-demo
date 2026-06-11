/* searchPage.js — חיפוש פרסומים */

$(document).ready(function () {
  $(".search-input").on("keyup", function (e) {
    if (e.key === "Enter") {
      doSearch();
    }
  });

  $(".search-icon").on("click", function () {
    doSearch();
  });

  $(".quick-card").on("click", function () {
    loadAllListings();
  });

  loadCategories();
});

function loadCategories() {
  ajaxCall("GET", "/api/categories", null,
    function (cats) {
      var sel = document.getElementById("filterCategory");
      if (!sel) return;
      cats.forEach(function (c) {
        var opt = document.createElement("option");
        opt.value = c.categoryId;
        opt.textContent = c.name;
        sel.appendChild(opt);
      });
    },
    function () {}
  );
}

function loadAllListings() {
  ajaxCall("GET", "/api/listings", null, searchSuccess, searchError);
}

function doSearch() {
  var text = ($(".search-input").val() || "").trim();
  var cat  = $("#filterCategory").val();
  var minP = $("#filterMinPrice").val();
  var maxP = $("#filterMaxPrice").val();

  if (minP !== "" && maxP !== "" && Number(minP) > Number(maxP)) {
    alert("טווח המחירים לא תקין: מחיר מינימלי גדול מהמקסימלי");
    return;
  }

  var params = [];
  if (text)        params.push("q=" + encodeURIComponent(text));
  if (cat)         params.push("category=" + encodeURIComponent(cat));
  if (minP !== "") params.push("minPrice=" + encodeURIComponent(minP));
  if (maxP !== "") params.push("maxPrice=" + encodeURIComponent(maxP));

  if (params.length === 0) {
    loadAllListings();
    return;
  }

  ajaxCall("GET", "/api/listings/search?" + params.join("&"), null, searchSuccess, searchError);
}

function searchSuccess(data) {
  var container = document.getElementById("searchResults");
  container.innerHTML = "";
  var grid = document.querySelector(".search-grid");

  if (data.length === 0) {
    grid.style.display = "grid";
    container.innerHTML = "<p style='text-align:center; color:#999; margin-top:30px;'>לא נמצאו תוצאות</p>";
    return;
  }

  grid.style.display = "none";

  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    var price = item.priceRequested;
    var title = escapeHtml(item.title);
    var location = escapeHtml(item.location || '');
    var img = escapeHtml(mediaUrl(item.imagePath) || 'https://via.placeholder.com/70x70?text=%F0%9F%8E%AB');
    var cat = escapeHtml(item.categoryName || '');

    container.innerHTML +=
      '<div class="result-card" onclick="window.location.href=\'productDetails.html?id=' + item.listingId + '\'">' +
        '<img src="' + img + '" class="result-img">' +
        '<div class="result-info">' +
          '<div class="result-title">' + title + '</div>' +
          '<div class="result-loc">' + location + '</div>' +
          '<div class="result-bottom">' +
            '<span class="result-cat">' + cat + '</span>' +
            '<span class="result-price">' + price + '₪</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

function searchError(err) {
  console.error("שגיאה בחיפוש:", err);
}
