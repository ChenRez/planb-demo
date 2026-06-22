// ═══════════════════════════════════════════════════════════════════════════
// navBar.js — רכיב ניווט משותף ל-PlanB
//
// מזריק את סרגל הניווט (bottom-nav) לכל דף אפליקציה שמשתמש בו.
// במובייל מוצג כסרגל תחתון; ב-desktop הופך אוטומטית ל-sidebar דרך responsive.css.
//
// שימוש: בכל דף אפליקציה הוסיפי בסוף ה-body:
//   <script src="js/components/navBar.js"></script>
// הרכיב מזריק את עצמו אוטומטית ומסמן את הטאב הפעיל לפי שם הקובץ הנוכחי.
// אם כבר קיים .bottom-nav בדף (home/search/favorites) — לא מכפיל.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // 5 הטאבים — זהים ל-bottom-nav הקיים ב-home.html
  var NAV_ITEMS = [
    { label: "בית", icon: "home", href: "home.html" },
    { label: "מועדפים", icon: "favorite", href: "favorites.html" },
    { label: "מכירה", icon: "add", href: "newSell.html", primary: true },
    { label: "חיפוש", icon: "search", href: "search.html" },
    { label: "פרופיל", icon: "person", href: "profile.html" },
  ];

  function currentPage() {
    var path = window.location.pathname.split("/").pop();
    return path && path.length ? path : "home.html";
  }

  function buildNav() {
    var active = currentPage();
    var nav = document.createElement("nav");
    nav.className = "bottom-nav";

    NAV_ITEMS.forEach(function (item) {
      var btn = document.createElement("button");
      btn.className = "nav-item" + (item.href === active ? " active" : "");
      btn.addEventListener("click", function () {
        window.location.href = item.href;
      });

      if (item.primary) {
        btn.innerHTML =
          '<div class="inline-circle-btn">' +
          '<span class="material-symbols-rounded">' + item.icon + "</span>" +
          "</div>" +
          '<span class="nav-label" style="font-weight:700;color:var(--text-main)">' +
          item.label + "</span>";
      } else {
        btn.innerHTML =
          '<span class="material-symbols-rounded nav-icon">' + item.icon + "</span>" +
          '<span class="nav-label">' + item.label + "</span>";
      }

      nav.appendChild(btn);
    });

    return nav;
  }

  function injectNav() {
    var container = document.querySelector(".mobile-container");
    if (!container) return;
    // אם כבר יש nav בדף — לא לכפול
    if (container.querySelector(".bottom-nav")) return;
    container.appendChild(buildNav());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectNav);
  } else {
    injectNav();
  }
})();
