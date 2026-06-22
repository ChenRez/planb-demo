// ─────────────────────────────────────────────────────
//  apiService.js  —  PlanB AJAX wrapper
//  פונקציה אחת לכל קריאות ה-API בפרויקט
//  usage: ajaxCall("GET", "/api/users", null, onSuccess, onError)
// ─────────────────────────────────────────────────────

// כתובת הבסיס של ה-API.
// בפיתוח מקומי (localhost/127.0.0.1/file://): מפנה תמיד ל-Kestrel בפורט 5277, כך שאפשר לפתוח
//   את הדפים גם מהשרת הפנימי של Rider (פורט 63342, "Open in Browser") / Live Server, וה-API
//   עדיין יעבוד — כל עוד השרת (הפרויקט) רץ ברקע.
// בפרודקשן (רופין): נגזרת אוטומטית מכתובת הסקריפט (אותו origin/בסיס, כולל תת-נתיב), ללא עדכון ידני.
// לכפיית כתובת ידנית מלאו את API_BASE_OVERRIDE (למשל "https://proj.ruppin.ac.il/..."), אחרת השאירו ריק.
const API_BASE_OVERRIDE = "";
const BASE_URL = API_BASE_OVERRIDE || (function () {
    var host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://" + host + ":5277";
    if (host === "" || location.protocol === "file:") return "http://localhost:5277";

    var marker = "/js/services/apiService.js";
    var self = document.currentScript;
    if (self && self.src && self.src.indexOf(marker) !== -1) {
        return self.src.substring(0, self.src.indexOf(marker));
    }
    var tags = document.getElementsByTagName("script");
    for (var i = tags.length - 1; i >= 0; i--) {
        var src = tags[i].src || "";
        var idx = src.indexOf(marker);
        if (idx !== -1) return src.substring(0, idx);
    }
    return location.origin;
})();

// בונה כתובת מלאה לקובץ מדיה מהשרת. נתיב שרת ("/uploads/..") מקבל קידומת BASE_URL;
// כתובת חיצונית מלאה (http/https) או נתיב יחסי לנכס סטטי ("pic/..") מוחזרים כמות שהם.
function mediaUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path) || path.indexOf("data:") === 0) return path;
    if (path.charAt(0) === "/") return BASE_URL + path;
    return path;
}

function requireAuth() {
    if (!localStorage.getItem("userId")) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function ajaxCall(method, api, data, successCB, errorCB) {
    var isFormData = (typeof FormData !== "undefined") && (data instanceof FormData);
    $.ajax({
        type:        method,
        url:         BASE_URL + api,
        data:        isFormData ? data : JSON.stringify(data),
        cache:       false,
        processData: isFormData ? false : true,
        contentType: isFormData ? false : "application/json; charset=utf-8",
        dataType:    "json",
        success:     successCB,
        error:       errorCB
    });
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// אייקון תצוגה לקטגוריה לפי category_id (יציב). קטגוריה לא מוכרת → אייקון ברירת מחדל.
const CATEGORY_ICONS = {
    1: '<i class="fas fa-music"></i>',
    2: '<i class="fas fa-basketball-ball"></i>',
    3: '<i class="fas fa-umbrella-beach"></i>',
    4: '<i class="fas fa-ticket-alt"></i>',
    5: '<i class="fas fa-microphone-alt"></i>',
    6: '<span class="material-symbols-rounded">attractions</span>',
    7: '<i class="fas fa-theater-masks"></i>',
    8: '<i class="fas fa-film"></i>',
    9: '<i class="fas fa-campground"></i>'
};

function categoryIconHtml(categoryId) {
    return CATEGORY_ICONS[categoryId] || '<i class="fas fa-tag"></i>';
}

// תמונת fallback גנרית (לוגו האפליקציה) — מוצגת רק אם תמונת מודעה לא נטענת.
// זמני להצגה; התאמת תמונה אמיתית למודעות שמשתמש מעלה תטופל בהמשך הפיתוח.
const FALLBACK_IMG = "/pic/Group.svg";

// מחזיר כתובת מלאה לתמונת ה-fallback (עובדת מקומית וברופין, כולל תת-נתיב).
function fallbackImg() {
    return mediaUrl(FALLBACK_IMG);
}

// אווטאר ברירת מחדל גנרי (סילואטה נקייה, ללא תמונות AI) — תואם לאייקון שמופיע באזור האישי.
// data-URI SVG כך שעובד בכל הדפים ללא תלות בקובץ חיצוני.
const AVATAR_FALLBACK =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>" +
        "<circle cx='50' cy='50' r='50' fill='#eceef3'/>" +
        "<circle cx='50' cy='39' r='17' fill='#b9c1cc'/>" +
        "<path d='M50 60c-17 0-29 11-29 27v13h58V87c0-16-12-27-29-27z' fill='#b9c1cc'/>" +
        "</svg>"
    );

// מחזיר את כתובת אווטאר ברירת המחדל הגנרי.
function avatarFallback() {
    return AVATAR_FALLBACK;
}


