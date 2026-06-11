// ─────────────────────────────────────────────────────
//  apiService.js  —  PlanB AJAX wrapper
//  פונקציה אחת לכל קריאות ה-API בפרויקט
//  usage: ajaxCall("GET", "/api/users", null, onSuccess, onError)
// ─────────────────────────────────────────────────────

// כתובת הבסיס של ה-API. נגזרת אוטומטית מהכתובת שממנה נטען קובץ זה (אותו שרת/בסיס),
// כך שעובדת מקומית וגם על שרת רופין (כולל תת-נתיב) ללא עדכון ידני.
// לכפיית כתובת ידנית מלאו את API_BASE_OVERRIDE (למשל "https://proj.ruppin.ac.il/..."), אחרת השאירו ריק.
const API_BASE_OVERRIDE = "";
const BASE_URL = API_BASE_OVERRIDE || (function () {
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


