/* ─────────────────────────────────────────────────────────────
   mockData.js  —  PlanB Demo Mock Data
   כל המידע לדמו — ללא חיבור לשרת / API
   ───────────────────────────────────────────────────────────── */

// ── קטגוריות ──────────────────────────────────────────────────
var MOCK_CATEGORIES = [
  { categoryId: 1, name: "הופעות" },
  { categoryId: 2, name: "ספורט" },
  { categoryId: 3, name: "פסטיבלים" },
  { categoryId: 4, name: "שוברים" },
  { categoryId: 5, name: "סטנדאפ" },
  { categoryId: 6, name: "אטרקציות" },
  { categoryId: 7, name: "הצגות" },
  { categoryId: 8, name: "קולנוע" },
  { categoryId: 9, name: "תיירות" }
];

// ── פרסומים ───────────────────────────────────────────────────
var MOCK_LISTINGS = [
  {
    listingId: 1,
    title: "נועה קירל - המופע הגדול",
    categoryId: 1,
    categoryName: "הופעות",
    location: "יד אליהו, תל אביב",
    eventDate: "2025-09-15T20:00:00",
    priceRequested: 180,
    priceOriginal: 280,
    quantity: 2,
    imagePath: "pic/noakirel.jpg",
    status: "Highlighted",
    sellerId: 42,
    sellerName: "דניאל לוי",
    sellerAvatarUrl: "uploads/avatars/avatar_42_e949f113-f4f7-4b5a-bb93-501c86f25be6.jpg",
    sellerTrustScore: 4.8,
    sellerTotalSales: 23,
    transferType: "קוד דיגיטלי",
    sectorSeat: "יציע B, כיסא 14",
    notes: "כרטיסים מקוריים שנקנו ישירות מהאתר הרשמי. מסיבות אישיות אינני יכול להגיע. ההעברה תתבצע דרך אפליקציית לייב-נייט.",
    splitMatchEnabled: true
  },
  {
    listingId: 2,
    title: "אינדיגו פסטיבל 2025",
    categoryId: 3,
    categoryName: "פסטיבלים",
    location: "פארק הירקון, תל אביב",
    eventDate: "2025-08-22T16:00:00",
    priceRequested: 320,
    priceOriginal: 490,
    quantity: 1,
    imagePath: "pic/indigo festival.png",
    status: "Highlighted",
    sellerId: 42,
    sellerName: "דניאל לוי",
    sellerAvatarUrl: "uploads/avatars/avatar_42_e949f113-f4f7-4b5a-bb93-501c86f25be6.jpg",
    sellerTrustScore: 4.8,
    sellerTotalSales: 23,
    transferType: "קוד דיגיטלי",
    sectorSeat: null,
    notes: "כרטיס לכל הפסטיבל (כל 3 הימים). קניתי לפני שנה וגיליתי שיש לי התנגשות בלוח הזמנים. מחיר מקורי 490 ₪, מוכר ב-320 ₪ בלבד.",
    splitMatchEnabled: false
  },
  {
    listingId: 3,
    title: "סופרלנד - כרטיס כניסה",
    categoryId: 6,
    categoryName: "אטרקציות",
    location: "ראשון לציון",
    eventDate: "2025-07-04T10:00:00",
    priceRequested: 120,
    priceOriginal: 195,
    quantity: 4,
    imagePath: "pic/superland.jpg",
    status: "Public",
    sellerId: 42,
    sellerName: "דניאל לוי",
    sellerAvatarUrl: "uploads/avatars/avatar_42_e949f113-f4f7-4b5a-bb93-501c86f25be6.jpg",
    sellerTrustScore: 4.8,
    sellerTotalSales: 23,
    transferType: "כרטיס פיזי",
    sectorSeat: null,
    notes: "4 כרטיסי כניסה לסופרלנד. בתוקף עד סוף הקיץ. המחיר הוא לכרטיס בודד. אפשר לקנות 1–4 כרטיסים. המוכר ישלח פיזית או יפגוש לאיסוף עצמי בראשון לציון.",
    splitMatchEnabled: true
  }
];

// ── משתמש דמו ─────────────────────────────────────────────────
var MOCK_USER = {
  userId: 1,
  firstName: "ישראל",
  lastName: "ישראלי",
  email: "demo@planb.co.il",
  phone: "050-1234567",
  city: "תל אביב",
  avatarUrl: "uploads/avatars/avatar_42_e949f113-f4f7-4b5a-bb93-501c86f25be6.jpg",
  scoreAsSeller: 88,
  totalSales: 7,
  createdAt: "2023-06-01T00:00:00"
};

// ── מועדפים דמו ───────────────────────────────────────────────
var MOCK_FAVORITES = [MOCK_LISTINGS[0], MOCK_LISTINGS[1]];

// ── מכירות דמו (המכירות שלי) ──────────────────────────────────
var MOCK_MY_SALES = [
  Object.assign({}, MOCK_LISTINGS[0], { createdAt: "2025-06-01T12:00:00" }),
  Object.assign({}, MOCK_LISTINGS[2], { createdAt: "2025-05-20T09:00:00" })
];

// ── רכישות דמו ────────────────────────────────────────────────
var MOCK_MY_PURCHASES = [
  {
    transactionId: 101,
    listingId: 2,
    listingTitle: "אינדיגו פסטיבל 2025",
    imagePath: "pic/indigo festival.png",
    eventDate: "2025-08-22T16:00:00",
    location: "פארק הירקון, תל אביב",
    priceRequested: 320,
    quantity: 1,
    status: "Completed",
    createdAt: "2025-06-10T14:00:00",
    sellerName: "דניאל לוי"
  }
];

// ── התראות דמו ────────────────────────────────────────────────
var MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "match",
    title: "נמצאה התאמה לנועה קירל!",
    body: "מצאנו קונה עבור הכרטיסים שלך ל-נועה קירל. לחץ לאישור העסקה.",
    time: "לפני 5 דקות",
    isRead: false
  },
  {
    id: 2,
    type: "sale",
    title: "הפרסום שלך אושר",
    body: "הפרסום 'סופרלנד - כרטיס כניסה' פורסם בהצלחה ונמצא בחיפושים.",
    time: "לפני 2 שעות",
    isRead: false
  },
  {
    id: 3,
    type: "info",
    title: "ברוך הבא ל-PlanB!",
    body: "תודה שנרשמת. כאן תקבל עדכונים על מכירות, רכישות והתאמות.",
    time: "אתמול",
    isRead: true
  }
];

/* ─────────────────────────────────────────────────────────────
   MOCK AJAX OVERRIDE
   מחליף את כל קריאות ajaxCall בנתונים מקומיים בלבד
   ───────────────────────────────────────────────────────────── */
function ajaxCall(method, api, data, successCB, errorCB) {
  // תמיד להחזיר נתונים מקומיים, ללא קריאות לשרת
  setTimeout(function () {
    try {
      var result = _mockDispatch(method, api, data);
      if (result !== undefined) {
        successCB(result);
      } else {
        // endpoint לא מוכר — קרא success עם מערך ריק כדי לא לשבור UI
        successCB([]);
      }
    } catch (e) {
      console.warn("[MockData] error for", method, api, e);
      if (errorCB) errorCB({ status: 500, responseText: e.message });
    }
  }, 120); // עיכוב קצר לחוויה ריאליסטית
}

function _mockDispatch(method, api, data) {
  // חתוך query string
  var path = api.split("?")[0];

  // GET /api/listings
  if (method === "GET" && path === "/api/listings") return MOCK_LISTINGS;

  // GET /api/categories
  if (method === "GET" && path === "/api/categories") return MOCK_CATEGORIES;

  // GET /api/listings/:id
  var mListing = path.match(/^\/api\/listings\/(\d+)$/);
  if (method === "GET" && mListing) {
    var id = parseInt(mListing[1]);
    var found = MOCK_LISTINGS.filter(function(l){ return l.listingId === id; })[0];
    return found || MOCK_LISTINGS[0];
  }

  // GET /api/listings/search?q=...&category=...&minPrice=...&maxPrice=...
  if (method === "GET" && path === "/api/listings/search") {
    var qs = api.split("?")[1] || "";
    var params = {};
    qs.split("&").forEach(function(p) {
      var kv = p.split("=");
      if (kv.length === 2) params[kv[0]] = decodeURIComponent(kv[1]);
    });
    return MOCK_LISTINGS.filter(function(l) {
      if (params.q && l.title.indexOf(params.q) === -1 && l.location.indexOf(params.q) === -1) return false;
      if (params.category && l.categoryId !== parseInt(params.category)) return false;
      if (params.minPrice && l.priceRequested < parseFloat(params.minPrice)) return false;
      if (params.maxPrice && l.priceRequested > parseFloat(params.maxPrice)) return false;
      return true;
    });
  }
    return MOCK_LISTINGS;

  // GET /api/listings/popular
  if (method === "GET" && path === "/api/listings/popular") return MOCK_LISTINGS;

  // GET /api/listings/by-seller/:sellerId
  if (method === "GET" && path.indexOf("/api/listings/by-seller/") === 0)
    return MOCK_MY_SALES;

  // GET /api/users/:id
  var mUser = path.match(/^\/api\/users\/(\d+)$/);
  if (method === "GET" && mUser) return MOCK_USER;

  // GET /api/users/:id/payment
  if (method === "GET" && /\/api\/users\/\d+\/payment/.test(path))
    return { cardNumber: "4111111111111234", expiryMonth: "12", expiryYear: "2027", cvv: "", idNumber: "" };

  // GET /api/users/:id/bank
  if (method === "GET" && /\/api\/users\/\d+\/bank/.test(path))
    return { bankName: "בנק לאומי", branchNumber: "800", accountNumber: "12345678", idNumber: "" };

  // GET /api/preferences/:userId
  if (method === "GET" && path.indexOf("/api/preferences/") === 0)
    return { categoryIds: [1, 3] };

  // GET /api/favorites/:userId
  if (method === "GET" && path.indexOf("/api/favorites/") === 0)
    return MOCK_FAVORITES.map(function(l) {
      return {
        listingId: l.listingId,
        listingTitle: l.title,
        imagePath: l.imagePath,
        eventDate: l.eventDate,
        location: l.location,
        priceRequested: l.priceRequested
      };
    });

  // POST /api/favorites  — just succeed silently
  if (method === "POST" && path === "/api/favorites") return { success: true };

  // DELETE /api/favorites/:uid/:lid
  if (method === "DELETE" && path.indexOf("/api/favorites/") === 0) return { success: true };

  // POST /api/listings (create listing)
  if (method === "POST" && path === "/api/listings") {
    var newId = 100 + MOCK_LISTINGS.length;
    return { listingId: newId, status: "Public" };
  }

  // POST /api/auth/login
  if (method === "POST" && path === "/api/auth/login")
    return { userId: 1, firstName: MOCK_USER.firstName, role: "user" };

  // POST /api/auth/register or signup
  if (method === "POST" && (path === "/api/auth/register" || path === "/api/users"))
    return { userId: 1, firstName: MOCK_USER.firstName, role: "user" };

  // DELETE /api/listings/:id
  if (method === "DELETE" && /^\/api\/listings\/\d+/.test(path)) return { success: true };

  // POST /api/listings/upload-image
  if (method === "POST" && path.indexOf("/upload-image") !== -1)
    return { url: "pic/1.jpg" };

  // GET /api/cities?q=...
  if (method === "GET" && path === "/api/cities") {
    var q = (api.split("q=")[1] || "").toLowerCase();
    var cities = ["תל אביב","ירושלים","חיפה","באר שבע","ראשון לציון","רמת גן","פתח תקווה","נתניה","אשדוד","הרצליה"];
    return cities.filter(function(c){ return c.indexOf(q) !== -1; }).map(function(c){ return { name: c }; });
  }

  // GET /api/chat/user/:id/conversations
  if (method === "GET" && /\/api\/chat\/user\//.test(path)) return [
    { conversationId: 1, listingTitle: "נועה קירל - המופע הגדול", otherUserName: "דניאל לוי", lastMessage: "היי, זה בקשר לכרטיסים?", lastTime: "10:42", avatarUrl: "", unreadCount: 1 }
  ];

  // GET /api/chat/:listingId
  if (method === "GET" && /^\/api\/chat\/\d+$/.test(path)) return [];

  // POST /api/chat/:listingId
  if (method === "POST" && /^\/api\/chat\/\d+$/.test(path)) return { success: true };

  // POST /api/disputes
  if (method === "POST" && path === "/api/disputes") return { success: true };

  // PUT/DELETE /api/notifications/:id
  if ((method === "PUT" || method === "DELETE") && /\/api\/notifications\//.test(path)) return { success: true };

  // GET /api/users/:id/trustScore or similar
  if (method === "GET" && /\/api\/users\/\d+\//.test(path)) return MOCK_USER;

  // GET /api/notifications/:userId
  if (method === "GET" && /\/api\/notifications\//.test(path)) return MOCK_NOTIFICATIONS;

  // GET /api/notifications (no userId)
  if (method === "GET" && path === "/api/notifications") return MOCK_NOTIFICATIONS;

  // GET /api/transactions (purchases)
  if (method === "GET" && path.indexOf("/api/transactions/by-buyer/") !== -1) return MOCK_MY_PURCHASES;

  if (method === "GET" && path.indexOf("/api/transactions") !== -1) return MOCK_MY_PURCHASES;

  // POST /api/users/:id  (profile update) — just return the user
  if (method === "POST" && /\/api\/users\/\d+/.test(path)) return MOCK_USER;

  // PUT /api/users/:id
  if (method === "PUT" && /\/api\/users\/\d+/.test(path)) return MOCK_USER;

  // everything else — succeed silently
  return { success: true };
}

/* ── שאר עזרים מ-apiService שדרוסים גם כן ── */
function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.indexOf("data:") === 0) return path;
  return path;
}

function requireAuth() {
  // בדמו — תמיד מחובר
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", "1");
    localStorage.setItem("firstName", MOCK_USER.firstName);
  }
  return true;
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

var CATEGORY_ICONS = {
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

// הגדר userId בדמו אם עדיין לא קיים
(function () {
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", "1");
    localStorage.setItem("firstName", "ישראל");
  }
})();
