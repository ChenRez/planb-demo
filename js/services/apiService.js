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

// ── דמו סטטי: גרסה ללא שרת ──────────────────────────────
// כל קריאות ה-API מנותבות לנתונים סטטיים (ראו בתחתית הקובץ). אין שום חיבור לרשת/שרת.
// mediaUrl: נתיב מוחלט ("/pic/..") מומר ליחסי ("pic/..") כדי לעבוד גם תחת תת-נתיב (GitHub Pages).
function mediaUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path) || path.indexOf("data:") === 0) return path;
    if (path.charAt(0) === "/") return path.substring(1);
    return path;
}

// כניסת דמו אוטומטית — כך שכל האזורים האישיים נגישים לטיול חופשי ללא התחברות.
(function ensureDemoUser() {
    try {
        if (!localStorage.getItem("userId")) {
            localStorage.setItem("userId", "100");
            localStorage.setItem("firstName", "עדי");
            localStorage.setItem("role", "user");
        }
    } catch (e) {}
})();

// באנר דמו עדין ודבוק למעלה — "תצוגה בלבד ללא חיבור לשרת". מוזרק בכל דף.
(function demoBanner() {
    function add() {
        if (!document.body || document.getElementById("demoOnlyBanner")) return;
        var b = document.createElement("div");
        b.id = "demoOnlyBanner";
        b.textContent = "תצוגת דמו בלבד · ללא חיבור לשרת";
        b.style.cssText = [
            "position:fixed", "top:0", "left:0", "right:0", "z-index:2147483647",
            "background:rgba(220,38,38,0.92)", "color:#fff", "font-size:11px",
            "font-weight:600", "text-align:center", "padding:3px 8px",
            "letter-spacing:.2px", "line-height:1.4", "pointer-events:none",
            "box-shadow:0 1px 4px rgba(0,0,0,.15)", "direction:rtl",
            "font-family:inherit", "backdrop-filter:saturate(120%)"
        ].join(";");
        document.body.appendChild(b);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add);
    else add();
})();

function requireAuth() {
    // בדמו תמיד מחוברים (משתמש דמו) — אין הפניה להתחברות.
    return true;
}

// ── ajaxCall — גרסת דמו: מנתב לנתונים סטטיים במקום שרת ──
function ajaxCall(method, api, data, successCB, errorCB) {
    var result;
    try {
        result = DemoApi.route(String(method || "GET").toUpperCase(), api, data);
    } catch (e) {
        result = { ok: false, err: { status: 500, responseJSON: { message: "שגיאת דמו" } } };
        console.error("DemoApi error", e);
    }
    // מדמה אסינכרוניות קלה כדי לשמר את חווית הטעינה המקורית.
    setTimeout(function () {
        if (result && result.ok) {
            if (typeof successCB === "function") successCB(result.data);
        } else {
            if (typeof errorCB === "function") errorCB((result && result.err) || { status: 500 });
        }
    }, 140);
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

// ════════════════════════════════════════════════════════════
//  DemoApi — שכבת נתונים סטטית (Mock) לדמו ללא שרת.
//  כל הנתונים כאן בלבד. אין חיבור לרשת/DB. לעריכת תוכן — ערכו כאן.
// ════════════════════════════════════════════════════════════
var DemoApi = (function () {
    function daysFromNow(d) { return new Date(Date.now() + d * 86400000).toISOString(); }
    function minsAgo(m)     { return new Date(Date.now() - m * 60000).toISOString(); }

    var CATEGORIES = [
        { categoryId: 1, name: "הופעות",   isActive: true },
        { categoryId: 2, name: "ספורט",    isActive: true },
        { categoryId: 3, name: "תיירות",   isActive: true },
        { categoryId: 4, name: "שוברים",   isActive: true },
        { categoryId: 5, name: "סטנדאפ",   isActive: true },
        { categoryId: 6, name: "אטרקציות", isActive: true },
        { categoryId: 7, name: "הצגות",    isActive: true },
        { categoryId: 8, name: "קולנוע",   isActive: true },
        { categoryId: 9, name: "פסטיבלים", isActive: true }
    ];
    var CAT_NAME = {};
    CATEGORIES.forEach(function (c) { CAT_NAME[c.categoryId] = c.name; });

    var SELLERS = {
        11:  { userId: 11,  firstName: "דניאל", lastName: "כהן",    trustScore: 4.8, totalSales: 23, totalPurchases: 4,  createdAt: "2023-03-12", avatarUrl: null, phone: "0521234567", email: "daniel@example.com", city: "תל אביב-יפו" },
        12:  { userId: 12,  firstName: "מאיה",  lastName: "לוי",    trustScore: 4.6, totalSales: 15, totalPurchases: 9,  createdAt: "2023-07-04", avatarUrl: null, phone: "0529876543", email: "maya@example.com",   city: "חיפה" },
        13:  { userId: 13,  firstName: "יואב",  lastName: "פרץ",    trustScore: 4.9, totalSales: 41, totalPurchases: 6,  createdAt: "2022-11-20", avatarUrl: null, phone: "0501112233", email: "yoav@example.com",   city: "ראשון לציון" },
        14:  { userId: 14,  firstName: "שירה", lastName: "אזולאי", trustScore: 4.3, totalSales: 8,  totalPurchases: 12, createdAt: "2024-01-15", avatarUrl: null, phone: "0544455566", email: "shira@example.com",  city: "ירושלים" },
        15:  { userId: 15,  firstName: "איתי",  lastName: "מזרחי",  trustScore: 5.0, totalSales: 60, totalPurchases: 3,  createdAt: "2022-05-09", avatarUrl: null, phone: "0537778899", email: "itai@example.com",   city: "נתניה" },
        16:  { userId: 16,  firstName: "נועה",  lastName: "פרידמן", trustScore: 4.5, totalSales: 12, totalPurchases: 7,  createdAt: "2023-09-28", avatarUrl: null, phone: "0526667788", email: "noa@example.com",    city: "רמת גן" },
        100: { userId: 100, firstName: "עדי", lastName: "",    trustScore: 4.7, totalSales: 3,  totalPurchases: 5,  createdAt: "2024-02-01", avatarUrl: null, phone: "0501234567", email: "nofar@example.com",  city: "תל אביב-יפו", profileDescription: "אוהבת הופעות, סטנדאפ ופסטיבלים." }
    };

    function L(o) {
        var s = SELLERS[o.sellerId] || {};
        o.categoryName     = CAT_NAME[o.categoryId] || "";
        o.eventDate        = daysFromNow(o.days);
        o.createdAt        = daysFromNow(-((o.id % 14) + 1));
        o.status           = o.status || "Public";
        o.quantity         = o.quantity || 1;
        o.splitMatchEnabled = o.quantity > 1;
        o.notes            = o.notes || "";
        o.sellerName       = ((s.firstName || "") + " " + (s.lastName || "")).trim();
        o.sellerAvatarUrl  = s.avatarUrl || null;
        o.sellerTrustScore = s.trustScore != null ? s.trustScore : null;
        o.sellerTotalSales = s.totalSales || 0;
        if (o.eventEndDays   != null) o.eventEndDate = daysFromNow(o.eventEndDays);
        if (o.validUntilDays != null) o.validUntil   = daysFromNow(o.validUntilDays);
        return o;
    }

    var PIC = function (id) { return "https://picsum.photos/seed/planb" + id + "/600/400"; };

    var LISTINGS = [
        // ── 1. הופעות ──────────────────────────────────────
        L({ id: 1,  categoryId: 1, title: "נועה קירל - היכל מנורה מבטחים",     location: "תל אביב",     priceRequested: 280, priceOriginal: 350, days: 12, imagePath: "pic/noakirel.jpg", quantity: 2, sellerId: 13, transferType: "כרטיס דיגיטלי (העברת בעלות)", status: "Highlighted", notes: "2 כרטיסים צמודים, יציע ראשי שורה 7. העברה דרך האתר הרשמי.", seatingType: "מקומות ישיבה", sectorSeat: "בלוק 3 / שורה 7 / מושבים 12-13" }),
        L({ id: 2,  categoryId: 1, title: "עומר אדם - פארק הירקון",            location: "תל אביב",     priceRequested: 320, priceOriginal: 400, days: 25, imagePath: "uploads/demo/stock/amfi.jpg", quantity: 4, sellerId: 11, transferType: "כרטיס דיגיטלי (קוד אישי)", notes: "4 כרטיסי קהל עומד, אזור גולדן ринг.", seatingType: "עמידה" }),
        L({ id: 3,  categoryId: 1, title: "אייל גולן - אמפי ראשון לציון",       location: "ראשון לציון", priceRequested: 180, priceOriginal: 260, days: 8,  imagePath: "uploads/demo/stock/zemer.jpg", quantity: 2, sellerId: 12, transferType: "כרטיס דיגיטלי (העברת בעלות)", status: "Price_Drop", notes: "נבצר ממני להגיע, מוכרת בהנחה. מושבים מעולים." }),
        // ── 2. ספורט ───────────────────────────────────────
        L({ id: 4,  categoryId: 2, title: "מכבי ת\"א - הפועל ירושלים (כדורסל)", location: "תל אביב",     priceRequested: 150, priceOriginal: 200, days: 5,  imagePath: "uploads/demo/stock/macabi.jpg", quantity: 2, sellerId: 15, transferType: "כרטיס דיגיטלי", status: "Highlighted", notes: "יורוליג! יציע מזרח, צמודים.", homeGroup: "מכבי תל אביב", awayGroup: "הפועל ירושלים", sectorSeat: "יציע מזרח / שער 5" }),
        L({ id: 5,  categoryId: 2, title: "מכבי חיפה - בית\"ר ירושלים",         location: "חיפה",        priceRequested: 220, priceOriginal: 280, days: 18, imagePath: "uploads/demo/stock/sport_soccer.jpg", quantity: 3, sellerId: 14, transferType: "כרטיס דיגיטלי (קוד)", notes: "3 כרטיסים יחד, אצטדיון סמי עופר.", homeGroup: "מכבי חיפה", awayGroup: "בית\"ר ירושלים" }),
        L({ id: 6,  categoryId: 2, title: "גמר גביע המדינה בכדורגל",            location: "תל אביב",     priceRequested: 300, priceOriginal: 300, days: 30, imagePath: "uploads/demo/stock/gmar.jpg", quantity: 2, sellerId: 13, transferType: "כרטיס פיזי", notes: "אצטדיון בלומפילד, יציע VIP." }),
        // ── 3. תיירות ──────────────────────────────────────
        L({ id: 7,  categoryId: 3, title: "חבילת נופש באילת - 3 לילות",         location: "אילת",        priceRequested: 1200, priceOriginal: 1600, days: 40, imagePath: "uploads/demo/stock/tour_eilat.jpg", quantity: 2, sellerId: 11, transferType: "אישור הזמנה ע\"ש הקונה", notes: "מלון ישרוטל, חצי פנסיון, זוג. ניתן להעביר שם.", eventEndDays: 43 }),
        L({ id: 8,  categoryId: 3, title: "סוף שבוע בצימר בגליל",               location: "ראש פינה",    priceRequested: 900,  priceOriginal: 1300, days: 15, imagePath: "uploads/demo/stock/roshpina.jpg", quantity: 2, sellerId: 16, transferType: "אישור הזמנה ע\"ש הקונה", notes: "צימר זוגי עם ג'קוזי, כולל ארוחת בוקר.", eventEndDays: 17 }),
        L({ id: 9,  categoryId: 3, title: "טיול מאורגן ליוון - 5 ימים",         location: "יציאה מנתב\"ג", priceRequested: 2500, priceOriginal: 3000, days: 60, imagePath: "uploads/demo/stock/boat.jpg", quantity: 2, sellerId: 15, transferType: "העברת שם מול הסוכנות", notes: "טיסות + מלונות + מדריך. שני מקומות.", eventEndDays: 65 }),
        // ── 4. שוברים ──────────────────────────────────────
        L({ id: 10, categoryId: 4, title: "שובר ZARA בשווי 500₪",               location: "מימוש ארצי",  priceRequested: 350, priceOriginal: 500, days: 90,  imagePath: "uploads/demo/stock/zara.png", quantity: 1, sellerId: 12, transferType: "קוד שובר דיגיטלי", status: "Price_Drop", notes: "שובר דיגיטלי, מימוש בכל הסניפים ובאתר.", validUntilDays: 120 }),
        L({ id: 11, categoryId: 4, title: "שובר זוגי לבורגר בביג",              location: "מימוש ארצי",  priceRequested: 90,  priceOriginal: 140, days: 45,  imagePath: "uploads/demo/stock/vouch_restaurant.jpg", quantity: 1, sellerId: 14, transferType: "קוד שובר דיגיטלי", notes: "ארוחה זוגית, כולל שתייה.", validUntilDays: 60 }),
        L({ id: 12, categoryId: 4, title: "שובר ספא זוגי במלון",                location: "הרצליה",      priceRequested: 250, priceOriginal: 400, days: 30,  imagePath: "uploads/demo/stock/vouch_spa.jpg", quantity: 2, sellerId: 16, transferType: "קוד שובר דיגיטלי", notes: "יום פינוק זוגי, עיסוי + כניסה לבריכה.", validUntilDays: 75 }),
        // ── 5. סטנדאפ ──────────────────────────────────────
        L({ id: 13, categoryId: 5, title: "שחר חסון - זאפה הרצליה",             location: "הרצליה",      priceRequested: 120, priceOriginal: 150, days: 10, imagePath: "uploads/demo/stock/jazz.jpg", quantity: 2, sellerId: 13, transferType: "כרטיס דיגיטלי", status: "Highlighted", notes: "שורה 3 מהבמה, מופע סולד אאוט.", seatingType: "מקומות ישיבה", sectorSeat: "שורה 3 / מושבים 5-6" }),
        L({ id: 14, categoryId: 5, title: "יוחאי ספרבר - מועדון בארבי",         location: "תל אביב",     priceRequested: 100, priceOriginal: 130, days: 22, imagePath: "uploads/demo/stock/rock.jpg", quantity: 4, sellerId: 11, transferType: "כרטיס דיגיטלי (קוד)", notes: "4 כרטיסים יחד, ישיבה ליד הבר." }),
        L({ id: 15, categoryId: 5, title: "אדיר מילר - היכל התרבות",           location: "תל אביב",     priceRequested: 140, priceOriginal: 200, days: 6,  imagePath: "uploads/demo/stock/thr_heichal.jpg", quantity: 2, sellerId: 15, transferType: "כרטיס דיגיטלי", status: "Price_Drop", notes: "מופע חדש! מושבים מרכזיים." }),
        // ── 6. אטרקציות ────────────────────────────────────
        L({ id: 16, categoryId: 6, title: "כרטיסים לסופרלנד",                   location: "ראשון לציון", priceRequested: 95,  priceOriginal: 140, days: 20, imagePath: "pic/superland.jpg", quantity: 4, sellerId: 16, transferType: "קוד כניסה דיגיטלי", notes: "4 כרטיסי כניסה לכל המתקנים.", validUntilDays: 60 }),
        L({ id: 17, categoryId: 6, title: "כרטיס זוגי ללונה פארק",              location: "תל אביב",     priceRequested: 110, priceOriginal: 150, days: 30, imagePath: "uploads/demo/stock/attr_lunapark.jpg", quantity: 2, sellerId: 12, transferType: "קוד כניסה דיגיטלי", notes: "כניסה זוגית כולל כל המתקנים.", validUntilDays: 70 }),
        L({ id: 18, categoryId: 6, title: "פארק המים ימית 2000",               location: "חולון",       priceRequested: 120, priceOriginal: 160, days: 14, imagePath: "uploads/demo/stock/attr_waterpark.jpg", quantity: 4, sellerId: 14, transferType: "קוד כניסה דיגיטלי", status: "Highlighted", notes: "כיף משפחתי, 4 כניסות.", validUntilDays: 45 }),
        // ── 7. הצגות ───────────────────────────────────────
        L({ id: 19, categoryId: 7, title: "מלך האריות - האופרה ת\"א",           location: "תל אביב",     priceRequested: 250, priceOriginal: 320, days: 28, imagePath: "uploads/demo/stock/aladdin.jpg", quantity: 2, sellerId: 13, transferType: "כרטיס דיגיטלי", notes: "המחזמר הגדול! מושבים באמצע אולם.", seatingType: "מקומות ישיבה", sectorSeat: "אמצע אולם / שורה 11" }),
        L({ id: 20, categoryId: 7, title: "פיטר פן - תיאטרון הבימה",           location: "תל אביב",     priceRequested: 90,  priceOriginal: 120, days: 9,  imagePath: "uploads/demo/stock/thr_habima.jpg", quantity: 4, sellerId: 11, transferType: "כרטיס דיגיטלי", notes: "הצגת ילדים, 4 כרטיסים יחד." }),
        L({ id: 21, categoryId: 7, title: "בילי אליוט - המחזמר",                location: "תל אביב",     priceRequested: 200, priceOriginal: 300, days: 35, imagePath: "uploads/demo/stock/thr_gesher.jpg", quantity: 2, sellerId: 15, transferType: "כרטיס דיגיטלי", status: "Price_Drop", notes: "זוג מושבים מעולים, יציע ראשי." }),
        // ── 8. קולנוע ──────────────────────────────────────
        L({ id: 22, categoryId: 8, title: "בכורת אווטאר 3 - סינמה סיטי",        location: "ירושלים",     priceRequested: 60,  priceOriginal: 80,  days: 4,  imagePath: "uploads/demo/stock/cin_cinemacity.jpg", quantity: 2, sellerId: 16, transferType: "כרטיס דיגיטלי (קוד)", status: "Highlighted", notes: "הקרנת בכורה IMAX, זוג כרטיסים." }),
        L({ id: 23, categoryId: 8, title: "כרטיסיית פסטיבל קולנוע ירושלים",     location: "ירושלים",     priceRequested: 120, priceOriginal: 160, days: 16, imagePath: "uploads/demo/stock/fes_movies.jpg", quantity: 2, sellerId: 14, transferType: "קוד דיגיטלי", notes: "כרטיסייה ל-4 סרטים." }),
        L({ id: 24, categoryId: 8, title: "הקרנת ערב יחיד - יס פלאנט",          location: "ראשון לציון", priceRequested: 45,  priceOriginal: 70,  days: 7,  imagePath: "uploads/demo/stock/cin_yesplanet.jpg", quantity: 4, sellerId: 12, transferType: "כרטיס דיגיטלי", status: "Price_Drop", notes: "4 כרטיסים, אולם VIP." }),
        // ── 9. פסטיבלים ────────────────────────────────────
        L({ id: 25, categoryId: 9, title: "אינדיגו פסטיבל",                     location: "פארק הירקון", priceRequested: 350, priceOriginal: 450, days: 50, imagePath: "pic/indigo festival.png", quantity: 2, sellerId: 15, transferType: "צמיד דיגיטלי / קוד", status: "Highlighted", notes: "כרטיס דו-יומי, כולל קמפינג.", eventEndDays: 52 }),
        L({ id: 26, categoryId: 9, title: "פסטיבל הבירה ירושלים",              location: "ירושלים",     priceRequested: 80,  priceOriginal: 110, days: 21, imagePath: "uploads/demo/stock/fes_beer.jpg", quantity: 4, sellerId: 11, transferType: "קוד כניסה דיגיטלי", notes: "4 כניסות, כולל כוס ראשונה.", eventEndDays: 23 }),
        L({ id: 27, categoryId: 9, title: "פסטיבל מוזיקה - מימונה לייב",         location: "קיסריה",      priceRequested: 150, priceOriginal: 220, days: 33, imagePath: "uploads/demo/stock/redsea_jazz.jpg", quantity: 2, sellerId: 13, transferType: "צמיד דיגיטלי / קוד", status: "Price_Drop", notes: "מופעים לאורך כל היום, זוג כרטיסים." })
    ];

    var LISTING_BY_ID = {};
    LISTINGS.forEach(function (l) { LISTING_BY_ID[l.listingId = l.id] = l; });

    // העדפות משתמש הדמו
    var PREFS = { categoryIds: [1, 5, 9], geoArea: "מרכז", minBudget: 50, maxBudget: 900, notificationPush: true, notificationSms: false, notificationEmail: true };

    // התראות משתמש הדמו
    var NOTIFICATIONS = [
        { notificationId: 1, type: "match_found",    message: "מצאנו לך התאמה! כרטיסים לנועה קירל שמתאימים בול להעדפות שלך.", isRead: false, sentAt: minsAgo(7),    listingId: 1 },
        { notificationId: 2, type: "price_drop",     message: "ירידת מחיר: אדיר מילר בהיכל התרבות עכשיו ב-140₪ בלבד.",        isRead: false, sentAt: minsAgo(140),  listingId: 15 },
        { notificationId: 3, type: "match_found",    message: "פתיחת מכירה לאינדיגו פסטיבל - בדיוק מה שחיפשת.",                isRead: false, sentAt: minsAgo(60 * 5), listingId: 25 },
        { notificationId: 4, type: "sale_completed", message: "הרכישה שלך לסופרלנד הושלמה בהצלחה. הכרטיסים ממתינים לך.",        isRead: true,  sentAt: minsAgo(60 * 26), listingId: 16 },
        { notificationId: 5, type: "system",         message: "ברוכה הבאה ל-PlanB! השלימי העדפות כדי לקבל התאמות חכמות.",       isRead: true,  sentAt: minsAgo(60 * 72), listingId: null }
    ];

    // עסקאות (רכישות) של משתמש הדמו
    var TRANSACTIONS = [
        { transactionId: 9001, listingTitle: "כרטיסים לסופרלנד",        sellerName: "נועה פרידמן", createdAt: minsAgo(60 * 26),  totalAmount: 100, quantity: 1, status: "Completed" },
        { transactionId: 9002, listingTitle: "אדיר מילר - היכל התרבות", sellerName: "איתי מזרחי",  createdAt: minsAgo(60 * 240), totalAmount: 145, quantity: 1, status: "Completed" },
        { transactionId: 9003, listingTitle: "שחר חסון - זאפה הרצליה",  sellerName: "יואב פרץ",    createdAt: minsAgo(60 * 50),  totalAmount: 125, quantity: 1, status: "Pending" }
    ];

    // שיחות צ'אט של משתמש הדמו
    var CONVERSATIONS = [
        { otherUserId: 13, otherUserName: "יואב פרץ",  listingId: 1, listingTitle: "נועה קירל - היכל מנורה", lastMessage: "מעולה, נתאם את העברת הכרטיסים מחר בבוקר", lastSent: minsAgo(30),  unreadCount: 1 },
        { otherUserId: 11, otherUserName: "דניאל כהן", listingId: 2, listingTitle: "עומר אדם - פארק הירקון", lastMessage: "הכרטיסים עדיין זמינים?",                  lastSent: minsAgo(180), unreadCount: 0 }
    ];

    var MESSAGES = {
        1: [
            { senderId: 100, receiverId: 13, content: "היי, הכרטיסים לנועה קירל עדיין זמינים?",       sentAt: minsAgo(90) },
            { senderId: 13,  receiverId: 100, content: "היי! כן, 2 כרטיסים צמודים יציע ראשי.",          sentAt: minsAgo(70) },
            { senderId: 100, receiverId: 13, content: "מושלם, אשמח לקנות. איך מעבירים?",                sentAt: minsAgo(50) },
            { senderId: 13,  receiverId: 100, content: "מעולה, נתאם את העברת הכרטיסים מחר בבוקר",       sentAt: minsAgo(30) }
        ],
        2: [
            { senderId: 100, receiverId: 11, content: "הכרטיסים עדיין זמינים?", sentAt: minsAgo(180) }
        ]
    };

    var CITIES = [
        { cityId: 1, name: "תל אביב-יפו", district: "תל אביב" }, { cityId: 2, name: "ירושלים", district: "ירושלים" },
        { cityId: 3, name: "חיפה", district: "חיפה" }, { cityId: 4, name: "ראשון לציון", district: "מרכז" },
        { cityId: 5, name: "באר שבע", district: "דרום" }, { cityId: 6, name: "נתניה", district: "מרכז" },
        { cityId: 7, name: "הרצליה", district: "תל אביב" }, { cityId: 8, name: "רמת גן", district: "תל אביב" },
        { cityId: 9, name: "אשדוד", district: "דרום" }, { cityId: 10, name: "פתח תקווה", district: "מרכז" },
        { cityId: 11, name: "רעננה", district: "מרכז" }, { cityId: 12, name: "אילת", district: "דרום" },
        { cityId: 13, name: "כפר סבא", district: "מרכז" }, { cityId: 14, name: "מודיעין", district: "מרכז" },
        { cityId: 15, name: "אשקלון", district: "דרום" }, { cityId: 16, name: "רחובות", district: "מרכז" }
    ];

    // ── מועדפים: נשמרים ב-localStorage כדי להישאר עקביים בין דפים ──
    function getFavIds() {
        try { return JSON.parse(localStorage.getItem("demoFavorites") || "[1,13]"); }
        catch (e) { return [1, 13]; }
    }
    function setFavIds(arr) { try { localStorage.setItem("demoFavorites", JSON.stringify(arr)); } catch (e) {} }

    function listingSummary(l) {
        return { listingId: l.listingId, listingTitle: l.title, title: l.title, eventDate: l.eventDate, location: l.location, priceRequested: l.priceRequested, imagePath: l.imagePath, categoryName: l.categoryName };
    }

    function ok(data)  { return { ok: true,  data: data }; }
    function fail(s, m) { return { ok: false, err: { status: s || 404, responseJSON: { message: m || "לא נמצא" } } }; }

    function parseQuery(qs) {
        var o = {};
        (qs || "").split("&").forEach(function (p) {
            if (!p) return;
            var kv = p.split("=");
            o[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
        });
        return o;
    }

    function route(method, api, data) {
        var qi   = api.indexOf("?");
        var path = qi === -1 ? api : api.substring(0, qi);
        var q    = parseQuery(qi === -1 ? "" : api.substring(qi + 1));
        var m, id;

        // ── GET ───────────────────────────────────────────
        if (method === "GET") {
            if (path === "/api/categories") return ok(CATEGORIES.slice());
            if (path === "/api/listings")   return ok(LISTINGS.slice());
            if (path === "/api/listings/popular") {
                var pop = [2, 4, 13, 16, 19, 22, 25, 7].map(function (i) { return LISTING_BY_ID[i]; }).filter(Boolean);
                return ok(pop);
            }
            if ((m = path.match(/^\/api\/listings\/for-you\/(\d+)$/))) {
                var cats = PREFS.categoryIds;
                return ok(LISTINGS.filter(function (l) { return cats.indexOf(l.categoryId) !== -1; }));
            }
            if ((m = path.match(/^\/api\/listings\/by-seller\/(\d+)$/))) {
                var sid = parseInt(m[1], 10);
                return ok(LISTINGS.filter(function (l) { return l.sellerId === sid; }));
            }
            if (path === "/api/listings/search") {
                var res = LISTINGS.slice();
                if (q.q)        res = res.filter(function (l) { return (l.title + " " + l.location).indexOf(q.q) !== -1; });
                if (q.category) res = res.filter(function (l) { return String(l.categoryId) === String(q.category); });
                if (q.minPrice) res = res.filter(function (l) { return l.priceRequested >= Number(q.minPrice); });
                if (q.maxPrice) res = res.filter(function (l) { return l.priceRequested <= Number(q.maxPrice); });
                return ok(res);
            }
            if ((m = path.match(/^\/api\/listings\/(\d+)$/))) {
                var l = LISTING_BY_ID[parseInt(m[1], 10)];
                return l ? ok(l) : fail(404, "הפרסום לא נמצא");
            }
            if ((m = path.match(/^\/api\/users\/(\d+)\/payment$/))) {
                return ok({ cardNumber: "4580123412341234", expiryMonth: 8, expiryYear: 2028, cvv: "123", idNumber: "204567891" });
            }
            if ((m = path.match(/^\/api\/users\/(\d+)\/bank$/))) {
                return ok({ bankName: "בנק הפועלים", branchNumber: "612", accountNumber: "45678912", idNumber: "204567891" });
            }
            if ((m = path.match(/^\/api\/users\/(\d+)$/))) {
                var u = SELLERS[parseInt(m[1], 10)] || SELLERS[100];
                return ok(u);
            }
            if ((m = path.match(/^\/api\/preferences\/(\d+)$/)))   return ok(PREFS);
            if ((m = path.match(/^\/api\/favorites\/(\d+)$/))) {
                var favs = getFavIds().map(function (i) { return LISTING_BY_ID[i]; }).filter(Boolean).map(listingSummary);
                return ok(favs);
            }
            if ((m = path.match(/^\/api\/notifications\/(\d+)$/))) return ok(NOTIFICATIONS.slice());
            if ((m = path.match(/^\/api\/chat\/user\/(\d+)\/conversations$/))) return ok(CONVERSATIONS.slice());
            if ((m = path.match(/^\/api\/chat\/(\d+)$/)))          return ok((MESSAGES[parseInt(m[1], 10)] || []).slice());
            if ((m = path.match(/^\/api\/transactions\/by-buyer\/(\d+)$/))) return ok(TRANSACTIONS.slice());
            if (path === "/api/cities") {
                var qq = (q.q || "").trim();
                var c = CITIES.filter(function (x) { return !qq || x.name.indexOf(qq) === 0 || x.name.indexOf(qq) !== -1; }).slice(0, 15);
                return ok(c);
            }
            return ok([]); // ברירת מחדל ל-GET לא ידוע — מערך ריק
        }

        // ── POST ──────────────────────────────────────────
        if (method === "POST") {
            if (path === "/api/auth/login")    return ok({ userId: 100, firstName: "עדי", role: "user" });
            if (path === "/api/auth/register") return ok({ userId: 100, firstName: "עדי", role: "user" });
            if (path === "/api/favorites") {
                var lid = data && data.listingId;
                if (lid) { var a = getFavIds(); if (a.indexOf(lid) === -1) a.push(lid); setFavIds(a); }
                return ok({ success: true });
            }
            if (path === "/api/transactions") return ok({ transactionId: 9000 + Math.floor(Math.random() * 999), status: "Completed" });
            if (path === "/api/disputes")     return ok({ disputeId: 7000 + Math.floor(Math.random() * 999) });
            if ((m = path.match(/^\/api\/chat\/(\d+)$/))) return ok({ success: true });
            if (path === "/api/listings/suggest-price") {
                var orig = data && (data.priceOriginal || data.originalPrice || data.price);
                var per  = orig ? Math.round(orig * 0.9) : 150;
                return ok({ pricePerTicket: per, totalPrice: null, source: "ai", confidence: "medium", soldOut: "no", sources: [],
                    explanation: "לפי ביקוש לאמן וקרבת מועד האירוע, מחיר הוגן לכרטיס הוא סביב " + per + "₪ (עד המחיר הנקוב). זוהי הדגמה — אין חיבור לרשת." });
            }
            if (path === "/api/listings/suggest-image") return ok({ imageUrl: "https://picsum.photos/seed/planbai/600/400", query: (data && data.title) || "", source: "demo" });
            if (path === "/api/listings/upload-image")  return ok({ url: "" });
            if (path === "/api/listings/upload-ticket") return ok({ path: "" });
            if (path === "/api/listings")               return ok({ listingId: 999, status: "Public" });
            return ok({ success: true });
        }

        // ── PUT / DELETE — תמיד מצליחים בדמו ──────────────
        if (method === "DELETE") {
            if ((m = path.match(/^\/api\/favorites\/(\d+)\/(\d+)$/))) {
                var rid = parseInt(m[2], 10);
                setFavIds(getFavIds().filter(function (i) { return i !== rid; }));
                return ok({ success: true });
            }
            return ok({ success: true });
        }
        if (method === "PUT") return ok({ success: true });

        return ok({ success: true });
    }

    return { route: route, _listings: LISTINGS, _categories: CATEGORIES };
})();


