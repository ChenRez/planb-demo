// ═══════════════════════════════════════════════════════════════════════════
// appHeader.js — ה-"chrome" המשותף של PlanB (top-bar + תפריט המבורגר)
//
// מזריק לכל דף-משנה:
//   1. top-bar דביק: [חזרה] ... לוגו ... [התראות] [המבורגר]
//   2. תפריט צד (drawer) עם ניווט משני: מכירות/רכישות/צ'אט/התראות/הגדרות/התנתקות
//
// שימוש: בכל דף-משנה הוסיפי בסוף ה-body (יחד עם navBar.js):
//   <script src="js/components/appHeader.js"></script>
// לא מזריק אם כבר קיים header/side-menu בדף (home/search/favorites) — מונע כפילות.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  function buildTopBar() {
    var bar = document.createElement("header");
    bar.className = "app-topbar";
    bar.innerHTML = `
      <button class="icon-btn" type="button" aria-label="חזרה" onclick="appGoBack()">
        <span class="material-symbols-rounded">arrow_forward</span>
      </button>
      <img src="pic/Group.svg" alt="PlanB" class="app-topbar-logo" />
      <div class="app-topbar-actions">
        <button class="icon-btn notification-btn" type="button" aria-label="התראות"
                onclick="window.location.href='notifications.html'">
          <i class="far fa-bell"></i>
        </button>
        <button class="icon-btn" type="button" aria-label="תפריט" onclick="toggleMenu()">
          <i class="fas fa-bars"></i>
        </button>
      </div>`;
    return bar;
  }

  function buildSideMenu() {
    var menu = document.createElement("div");
    menu.id = "side-menu";
    menu.className = "side-menu";
    menu.innerHTML = `
      <div class="menu-content">
        <div class="menu-header">
          <div class="menu-user-info">
            <div class="menu-avatar-circle">
              <i class="fas fa-user menu-avatar-icon" id="menuAvatarIcon"></i>
              <img id="menuAvatarImg" class="menu-avatar-img" style="display:none" alt="" />
            </div>
            <div class="user-meta">
              <h3 id="menuUserName">החשבון שלי</h3>
              <a href="profile.html">מעבר לאזור אישי</a>
            </div>
          </div>
          <button class="close-btn" type="button" onclick="toggleMenu()">&times;</button>
        </div>
        <nav class="menu-nav">
          <div class="nav-group">
            <a href="mySales.html" class="nav-link"><i class="fas fa-tags"></i> המכירות שלי</a>
            <a href="myPurchases.html" class="nav-link"><i class="fas fa-shopping-bag"></i> הרכישות שלי</a>
            <a href="chat.html" class="nav-link"><i class="fas fa-comments"></i> צ'אט</a>
            <a href="notifications.html" class="nav-link"><i class="fas fa-bell"></i> התראות</a>
          </div>
          <div class="nav-group bottom-group">
            <a href="#" class="nav-link"><i class="fas fa-cog"></i> הגדרות</a>
            <a href="login.html" class="nav-link logout" onclick="appLogout()"><i class="fas fa-sign-out-alt"></i> התנתק</a>
          </div>
        </nav>
      </div>`;
    return menu;
  }

  function buildOverlay() {
    var ov = document.createElement("div");
    ov.id = "menu-overlay";
    ov.className = "menu-overlay";
    ov.addEventListener("click", function () {
      if (typeof window.toggleMenu === "function") window.toggleMenu();
    });
    return ov;
  }

  function populateUser() {
    var nameEl = document.getElementById("menuUserName");
    if (!nameEl) return;
    var cached = localStorage.getItem("userName") || localStorage.getItem("fullName");
    if (cached) nameEl.textContent = cached;
  }

  function ensureNotificationBadge() {
    if (!document.querySelector(".notification-btn")) return;
    if (typeof window.refreshNotificationBadge === "function") {
      window.refreshNotificationBadge();
      return;
    }
    if (document.querySelector('script[data-notif-svc]')) return;
    var s = document.createElement("script");
    s.src = "js/services/notificationService.js";
    s.setAttribute("data-notif-svc", "1");
    s.onload = function () {
      if (typeof window.refreshNotificationBadge === "function") {
        window.refreshNotificationBadge();
      }
    };
    document.body.appendChild(s);
  }

  function inject() {
    var container = document.querySelector(".mobile-container");
    if (!container) return;

    // top-bar — רק אם אין כבר header/top-bar קיים בדף
    if (
      !container.querySelector(".app-topbar") &&
      !container.querySelector(".header") &&
      !container.querySelector(".top-bar")
    ) {
      container.insertBefore(buildTopBar(), container.firstChild);
    }

    // תפריט צד + overlay — רק אם לא קיימים
    if (!document.getElementById("side-menu")) {
      container.appendChild(buildSideMenu());
    }
    if (!document.getElementById("menu-overlay")) {
      container.appendChild(buildOverlay());
    }

    populateUser();
    ensureNotificationBadge();
  }

  // ── Global handlers (מוגנים — לא דורסים מימושים קיימים בדף) ─────────────
  if (typeof window.toggleMenu !== "function") {
    window.toggleMenu = function () {
      var menu = document.getElementById("side-menu");
      var overlay = document.getElementById("menu-overlay");
      if (menu) menu.classList.toggle("open");
      if (overlay) overlay.classList.toggle("show");
    };
  }

  if (typeof window.appGoBack !== "function") {
    window.appGoBack = function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "home.html";
      }
    };
  }

  if (typeof window.appLogout !== "function") {
    window.appLogout = function () {
      try {
        localStorage.removeItem("userId");
      } catch (e) {}
      // הניווט ל-login.html מתבצע ע"י ה-href של הקישור
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
