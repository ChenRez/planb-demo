/* homePage.js — לוגיקת דף הבית */

document.addEventListener("DOMContentLoaded", function () {
  const firstName = localStorage.getItem("firstName");
  const el = document.getElementById("greetingName");
  if (el) el.textContent = firstName || "אורח";

  const menuName = document.getElementById("menuUserName");
  if (menuName) menuName.textContent = firstName || "אורח";

  loadMenuAvatar();
});

/* תמונת הפרופיל בתפריט הצד */
function loadMenuAvatar() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  ajaxCall("GET", "/api/users/" + userId, null,
    function (user) {
      if (!user || !user.avatarUrl) return;
      const img  = document.getElementById("menuAvatarImg");
      const icon = document.getElementById("menuAvatarIcon");
      if (!img || !icon) return;
      img.src = mediaUrl(user.avatarUrl);
      img.style.display = "block";
      icon.style.display = "none";
    },
    function () {}
  );
}

/* טעינת פרסומים מהשרת */
let allListings = [];
var _personalizedCards = [];
var _popularCards = [];
var _lastMinuteCards = [];
var _hasPrefs = false;
var _currentForYouTab = 'personalized';

$(document).ready(function () {
  ajaxCall("GET", "/api/listings", null, loadListingsSuccess, loadListingsError);
  ajaxCall("GET", "/api/categories", null, renderCategoryChips, function () {});

  $("#mainSearchInput").on("keyup", function (e) {
    if (e.key === "Enter") {
      applyFilters();
    }
  });
});

function loadListingsSuccess(data) {
  allListings = [];
  for (var i = 0; i < data.length; i++) {
    allListings.push({
      id:     data[i].listingId,
      title:  data[i].title,
      loc:    data[i].location || '',
      cat:    data[i].categoryName || '',
      price:  data[i].priceRequested,
      img:         mediaUrl(data[i].imagePath) || 'pic/' + data[i].listingId + '.jpg',
      date:         new Date(data[i].eventDate).toLocaleDateString('he-IL'),
      status:       data[i].status || 'Public',
      priceOriginal: data[i].priceOriginal || null
    });
  }
  renderForYouSection();
  renderLastMinuteSection();
  renderMainContent();
}

/* ─── "בול בשבילך" — לפי העדפות משתמש מחובר, אחרת Highlighted ─── */
function renderForYouSection() {
  var container = document.getElementById("forYouList");
  if (!container) return;
  container.innerHTML = "";

  var userId = localStorage.getItem("userId");
  if (userId) {
    ajaxCall("GET", "/api/preferences/" + userId, null,
      function(prefs) {
        _hasPrefs = prefs && prefs.categoryIds && prefs.categoryIds.length > 0;
        var titleEl = document.getElementById("forYouTitle");
        if (titleEl) titleEl.textContent = _hasPrefs ? "בול בשבילך" : "🔥 פופלריים עכשיו";
        var tabsEl = document.getElementById("forYouTabs");
        if (tabsEl && _hasPrefs) tabsEl.style.display = "flex";
      },
      function() {}
    );
    ajaxCall("GET", "/api/listings/for-you/" + userId, null,
      function(data) {
        _personalizedCards = data.map(function(d) {
          return {
            id:    d.listingId,
            title: d.title,
            loc:   d.location || '',
            cat:   d.categoryName || '',
            price: d.priceRequested,
            img:   mediaUrl(d.imagePath) || 'pic/' + d.listingId + '.jpg',
            date:  new Date(d.eventDate).toLocaleDateString('he-IL')
          };
        });
        renderForYouCards(_personalizedCards);
      },
      function() {
        renderForYouCards(allListings.filter(function(l) { return l.status === "Highlighted"; }).slice(0, 6));
      }
    );
  } else {
    var highlighted = allListings.filter(function(l) { return l.status === "Highlighted"; });
    if (highlighted.length === 0) highlighted = allListings.slice();
    _personalizedCards = highlighted;
    renderForYouCards(highlighted.slice(0, 6));
  }
}

function renderForYouCards(forYou) {
  var container = document.getElementById("forYouList");
  if (!container) return;
  forYou.forEach(function(ev) {
    container.innerHTML += `
      <div class="event-card" onclick="goToProduct(${ev.id})">
        <div class="card-image-wrap">
          <img src="${escapeHtml(ev.img)}" class="card-bg" onerror="this.src='pic/default.jpg'; this.onerror=null;" />
          <div class="badge-category">${escapeHtml(ev.cat)}</div>
        </div>
        <div class="card-content">
          <div class="card-header-row">
            <h3 class="card-title">${escapeHtml(ev.title)}</h3>
            <div class="heart-btn" data-id="${ev.id}" onclick="toggleHeart(this); event.stopPropagation();">
              <span class="material-symbols-rounded" style="font-size:20px">favorite_border</span>
            </div>
          </div>
          <div class="card-info-row">
            <span class="material-symbols-rounded filled-icon" style="font-size:18px; color:var(--accent-yellow)">location_on</span>
            <span>${escapeHtml(ev.loc)}</span>
          </div>
          <div class="card-info-row">
            <span class="material-symbols-rounded calendar-icon-styled">calendar_today</span>
            <span>${ev.date}</span>
          </div>
          <div class="card-footer-row">
            <div class="price-group">
              <span class="price-label">החל מ-</span>
              <div class="price-value">${ev.price}₪</div>
            </div>
            <button class="ticket-btn" onclick="goToProduct(${ev.id}); event.stopPropagation();">לכרטיסים</button>
          </div>
        </div>
      </div>`;
  });
}

function switchForYouTab(tab) {
  _currentForYouTab = tab;
  document.getElementById('tabPersonalized').classList.toggle('active', tab === 'personalized');
  document.getElementById('tabPopular').classList.toggle('active', tab === 'popular');

  if (tab === 'personalized') {
    renderForYouCards(_personalizedCards);
  } else {
    if (_popularCards.length > 0) {
      renderForYouCards(_popularCards);
    } else {
      ajaxCall("GET", "/api/listings/popular", null,
        function(data) {
          var allPopular = data.map(function(d) {
            return {
              id:    d.listingId,
              title: d.title,
              loc:   d.location || '',
              cat:   d.categoryName || '',
              price: d.priceRequested,
              img:   mediaUrl(d.imagePath) || 'pic/' + d.listingId + '.jpg',
              date:  new Date(d.eventDate).toLocaleDateString('he-IL')
            };
          });
          var personalizedIds = _personalizedCards.map(function(c) { return c.id; });
          _popularCards = allPopular.filter(function(c) { return personalizedIds.indexOf(c.id) === -1; });
          if (_popularCards.length === 0) _popularCards = allPopular;
          renderForYouCards(_popularCards);
        },
        function() {}
      );
    }
  }
}

/* ─── "מחירים שווים של הרגע האחרון" — הנחה >= 30% ממחיר מקורי ─── */
function renderLastMinuteSection() {
  var container = document.getElementById("lastMinuteList");
  if (!container) return;
  container.innerHTML = "";

  _lastMinuteCards = allListings
    .filter(function(l) {
      if (!l.priceOriginal || l.priceOriginal <= 0) return false;
      var discount = (l.priceOriginal - l.price) / l.priceOriginal;
      return discount >= 0.30;
    })
    .sort(function(a, b) {
      var discA = (a.priceOriginal - a.price) / a.priceOriginal;
      var discB = (b.priceOriginal - b.price) / b.priceOriginal;
      return discB - discA;
    });

  var lastMinute = _lastMinuteCards.slice(0, 3);

  lastMinute.forEach(function(ev) {
    var discountPct = Math.round((ev.priceOriginal - ev.price) / ev.priceOriginal * 100);
    container.innerHTML += `
      <div class="v-card" onclick="goToProduct(${ev.id})">
        <div class="v-card-img-wrap">
          <img src="${escapeHtml(ev.img)}" class="v-card-img" onerror="this.src='pic/default.jpg'; this.onerror=null;" />
          <div class="v-badge-category">${escapeHtml(ev.cat)}</div>
          <div class="badge-discount"><span class="material-symbols-rounded filled-icon" style="font-size:14px">sell</span>${discountPct}% הנחה</div>
        </div>
        <div class="v-card-content">
          <div class="v-card-header">
            <div class="v-card-title">${escapeHtml(ev.title)}</div>
            <div class="heart-btn" data-id="${ev.id}" onclick="toggleHeart(this); event.stopPropagation();" style="width:36px; height:36px">
              <span class="material-symbols-rounded" style="font-size:22px">favorite_border</span>
            </div>
          </div>
          <div class="v-location">
            <span class="material-symbols-rounded filled-icon" style="font-size:16px; color:var(--accent-yellow)">location_on</span>
            ${escapeHtml(ev.loc)}
          </div>
          <div class="v-date">
            <span class="material-symbols-rounded calendar-icon-styled">calendar_today</span>
            <span>${ev.date}</span>
          </div>
          <div class="v-card-footer">
            <div class="v-price">${ev.price}₪</div>
            <button class="v-btn-small">לרכישה</button>
          </div>
        </div>
      </div>`;
  });
}

function loadListingsError(err) {
  console.error("שגיאה בטעינת פרסומים:", err);
}

/* ─── 2. ניווט לפרטי מוצר ───────────────────────────────── */
function goToProduct(id) {
  window.location.href = `productDetails.html?id=${id}`;
}

/* ─── 3. ניהול קטגוריות (בחירה מרובה) ─────────────────── */
let selectedCategories = new Set(["הכל"]);

function renderCategoryChips(cats) {
  var row  = document.getElementById("categoriesRow");
  var menu = document.getElementById("catAccordion");
  (cats || []).forEach(function (c) {
    if (row) {
      var item = document.createElement("div");
      item.className = "cat-item";
      item.dataset.cat = c.name;

      var circle = document.createElement("div");
      circle.className = "cat-circle";
      var box = document.createElement("div");
      box.className = "cat-content-box";
      box.innerHTML = categoryIconHtml(c.categoryId);
      circle.appendChild(box);

      var label = document.createElement("span");
      label.className = "cat-label";
      label.textContent = c.name;

      item.appendChild(circle);
      item.appendChild(label);
      item.addEventListener("click", function () { toggleCategory(item, c.name); });
      row.appendChild(item);
    }

    if (menu) {
      var ml = document.createElement("label");
      ml.className = "modern-cat-item";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.addEventListener("change", function () { toggleCategoryFromMenu(c.name); });
      ml.appendChild(cb);
      ml.insertAdjacentHTML("beforeend", categoryIconHtml(c.categoryId));
      var ms = document.createElement("span");
      ms.textContent = c.name;
      ml.appendChild(ms);
      menu.appendChild(ml);
    }
  });
}

function toggleCategory(el, catName) {
  if (catName === "הכל") {
    selectedCategories.clear();
    selectedCategories.add("הכל");
    document.querySelectorAll(".cat-item").forEach((item) => {
      item.classList.remove("active");
      item.querySelector(".cat-circle").classList.remove("active");
    });
    el.classList.add("active");
    el.querySelector(".cat-circle").classList.add("active");
  } else {
    if (selectedCategories.has("הכל")) {
      selectedCategories.delete("הכל");
      const allBtn = document.querySelector('[data-cat="הכל"]');
      allBtn.classList.remove("active");
      allBtn.querySelector(".cat-circle").classList.remove("active");
    }
    if (selectedCategories.has(catName)) {
      selectedCategories.delete(catName);
      el.classList.remove("active");
      el.querySelector(".cat-circle").classList.remove("active");
    } else {
      selectedCategories.add(catName);
      el.classList.add("active");
      el.querySelector(".cat-circle").classList.add("active");
    }
    if (selectedCategories.size === 0) {
      selectedCategories.add("הכל");
      const allBtn = document.querySelector('[data-cat="הכל"]');
      allBtn.classList.add("active");
      allBtn.querySelector(".cat-circle").classList.add("active");
    }
  }
  renderMainContent();
}

function toggleCategoryFromMenu(catName) {
  const el = document.querySelector(`[data-cat="${catName}"]`);
  if (el) toggleCategory(el, catName);
}

/* ─── ראו הכל ─────────────────────────────────────────── */
function _openResultsView(title, cards) {
  document.getElementById("default-home-view").style.display = "none";
  document.getElementById("no-results-view").style.display = "none";
  document.getElementById("filtered-results-view").style.display = "block";
  document.getElementById("resultsTitle").innerText = title;
  injectCardsToResults(cards);
}

function showAllListings() {
  if (_hasPrefs && _currentForYouTab === 'popular') {
    if (_popularCards.length > 0) {
      _openResultsView('🔥 פופלריים עכשיו', _popularCards);
    } else {
      ajaxCall("GET", "/api/listings/popular", null,
        function(data) {
          _popularCards = data.map(function(d) {
            return { id: d.listingId, title: d.title, loc: d.location || '', cat: d.categoryName || '', price: d.priceRequested, img: mediaUrl(d.imagePath) || 'pic/' + d.listingId + '.jpg', date: new Date(d.eventDate).toLocaleDateString('he-IL') };
          });
          _openResultsView('🔥 פופלריים עכשיו', _popularCards);
        },
        function() { _openResultsView('🔥 פופלריים עכשיו', allListings); }
      );
    }
    return;
  }

  if (_personalizedCards.length > 0) {
    var title = _hasPrefs ? 'בול בשבילך' : '🔥 פופלריים עכשיו';
    _openResultsView(title, _personalizedCards);
  } else {
    _openResultsView('כל הפרסומים', allListings);
  }
}

function showLastMinuteAll() {
  if (_lastMinuteCards.length > 0) {
    _openResultsView('מחירים שווים של הרגע האחרון', _lastMinuteCards);
  } else {
    _openResultsView('מחירים שווים של הרגע האחרון', allListings);
  }
}

function goBackToHome() {
  document.getElementById("filtered-results-view").style.display = "none";
  document.getElementById("no-results-view").style.display = "none";
  document.getElementById("default-home-view").style.display = "block";
  selectedCategories.clear();
  selectedCategories.add("הכל");
  document.querySelectorAll(".cat-item").forEach(function(item) {
    item.classList.remove("active");
    item.querySelector(".cat-circle").classList.remove("active");
  });
  var allBtn = document.querySelector('[data-cat="הכל"]');
  if (allBtn) {
    allBtn.classList.add("active");
    allBtn.querySelector(".cat-circle").classList.add("active");
  }
}

/* ─── 4. רינדור תוצאות ──────────────────────────────────── */
function renderMainContent() {
  const defaultView   = document.getElementById("default-home-view");
  const resultsView   = document.getElementById("filtered-results-view");
  const noResultsView = document.getElementById("no-results-view");
  noResultsView.style.display = "none";

  if (selectedCategories.has("הכל")) {
    defaultView.style.display = "block";
    resultsView.style.display = "none";
  } else {
    defaultView.style.display = "none";
    resultsView.style.display = "block";
    const catsArray = Array.from(selectedCategories);
    document.getElementById("resultsTitle").innerText = `תוצאות עבור: ${catsArray.join(", ")}`;
    const filteredEvents = allListings.filter((ev) => selectedCategories.has(ev.cat));
    injectCardsToResults(filteredEvents);
  }
}

function injectCardsToResults(eventsArray) {
  const resultsList = document.getElementById("dynamicResultsList");
  resultsList.innerHTML = "";

  if (eventsArray.length === 0) {
    resultsList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">לא נמצאו תוצאות בקטגוריה זו...</p>';
    return;
  }

  eventsArray.forEach((ev) => {
    let badgeHtml = "";
    if (ev.badge === "discount") {
      badgeHtml = `<div class="badge-discount"><span class="material-symbols-rounded filled-icon" style="font-size:14px">sell</span>15% הנחה</div>`;
    } else if (ev.badge === "trusted") {
      badgeHtml = `<div class="v-badge-category" style="background:#fff9c4; color:#f59e0b; right:auto; left:12px; font-size:10px;"><i class="fas fa-medal"></i> מוכר אמין</div>`;
    }

    const card = `
      <div class="v-card" onclick="goToProduct(${ev.id})">
        <div class="v-card-img-wrap">
          <img src="${escapeHtml(ev.img)}" class="v-card-img" onerror="this.src='pic/default.jpg'; this.onerror=null;" />
          <div class="v-badge-category">${escapeHtml(ev.cat)}</div>
          ${badgeHtml}
        </div>
        <div class="v-card-content">
          <div class="v-card-header">
            <div class="v-card-title">${escapeHtml(ev.title)}</div>
            <div class="heart-btn" onclick="toggleHeart(this); event.stopPropagation()">
              <span class="material-symbols-rounded" style="font-size:22px">favorite_border</span>
            </div>
          </div>
          <div class="v-location">
            <span class="material-symbols-rounded filled-icon" style="font-size:16px; color:var(--accent-yellow)">location_on</span>
            ${escapeHtml(ev.loc)}
          </div>
          <div class="v-date">
            <span class="material-symbols-rounded calendar-icon-styled">calendar_today</span>
            <span>${ev.date}</span>
          </div>
          <div class="v-card-footer">
            <div class="v-price">${ev.price}₪</div>
            <button class="v-btn-small">לרכישה</button>
          </div>
        </div>
      </div>`;
    resultsList.innerHTML += card;
  });
}

/* ─── 5. פילטר דינאמי ───────────────────────────────────── */
function openDynamicFilter() {
  const modal   = document.getElementById("filterModal");
  const content = document.getElementById("filterContent");
  content.innerHTML = "";

  content.innerHTML += createSectionHeader("סינון כללי");
  content.innerHTML += createLocationInput();
  content.innerHTML += createInput("תקציב מקסימלי (₪)", "number", "כמה בא לך להוציא?");
  content.innerHTML += createRating("כמה חשוב לך דירוג המוכר?");
  content.innerHTML += createCounter("amount-global", "כמות כרטיסים / אנשים");

  let showSingleDate = false, showDateRange = false, showValidity = false;
  const singleDateCats = ["הופעות","הצגות","קולנוע","ספורט","סטנדאפ","סטנד אפ"];
  const rangeDateCats  = ["פסטיבלים","תיירות","אטרקציות"];

  if (selectedCategories.has("הכל") || selectedCategories.size === 0) {
    showDateRange = true;
  } else {
    selectedCategories.forEach((cat) => {
      if (singleDateCats.includes(cat)) showSingleDate = true;
      if (rangeDateCats.includes(cat))  showDateRange  = true;
      if (cat === "שוברים")             showValidity   = true;
    });
  }

  if (showSingleDate) content.innerHTML += createInput("תאריך האירוע", "date");
  if (showDateRange)  content.innerHTML += createDateRange("טווח תאריכים רצוי");
  if (showValidity)   content.innerHTML += createInput("בתוקף עד / ניתן למימוש עד:", "date");

  if (selectedCategories.has("הופעות"))  { content.innerHTML += createSectionHeader("הופעות");  content.innerHTML += createChips("סגנון מוזיקלי", ["מזרחית","רוק","פופ","ראפ","אחר"]); }
  if (selectedCategories.has("ספורט"))   { content.innerHTML += createSectionHeader("ספורט");   content.innerHTML += createChips("סוג ספורט", ["כדורגל","כדורסל","טניס","אחר"]); content.innerHTML += createChips("סוג כרטיס", ["מנוי","משחק בודד","כרטיס לעונה"]); }
  if (selectedCategories.has("אטרקציות")){ content.innerHTML += createSectionHeader("אטרקציות"); content.innerHTML += createChips("למי זה מתאים?", ["כל המשפחה","ילדים","נוער","מבוגרים"]); }
  if (selectedCategories.has("שוברים"))  { content.innerHTML += createSectionHeader("שוברים");  content.innerHTML += createChips("סוג שובר", ["מסעדות","קניות","בילוי","אופנה","טיסות"]); content.innerHTML += createInput("רשת למימוש","text","זארה, פוקס, אדידס..."); content.innerHTML += createChips("סוג מימוש", ["אונליין","פיזי בסניף","גם וגם"]); content.innerHTML += createInput("שווי השובר (₪)","number"); }
  if (selectedCategories.has("תיירות"))  { content.innerHTML += createSectionHeader("תיירות");  content.innerHTML += createChips("סוג לינה", ["מלון","צימר","דירת אירוח","קמפינג"]); content.innerHTML += createCounter("adults-count","כמות מבוגרים"); content.innerHTML += createCounter("kids-count","כמות ילדים"); }
  if (selectedCategories.has("פסטיבלים")){ content.innerHTML += createSectionHeader("פסטיבלים"); content.innerHTML += createChips("סגנון פסטיבל",["אוכל","מוזיקה","אמנות","טכנולוגיה"]); content.innerHTML += createChips("סוג כרטיס",["יומי","לכל הפסטיבל",'סופ"ש']); }

  modal.classList.add("show");
}

function closeFilterModal() {
  document.getElementById("filterModal").classList.remove("show");
}

function applyFilters() {
  closeFilterModal();
  const searchInput = document.getElementById("mainSearchInput");
  let query = searchInput ? searchInput.value.trim() : "";

  if (!query) { renderMainContent(); return; }

  const foundEvents   = allListings.filter((ev) => ev.title.includes(query) || ev.loc.includes(query));
  const defaultView   = document.getElementById("default-home-view");
  const resultsView   = document.getElementById("filtered-results-view");
  const noResultsView = document.getElementById("no-results-view");

  defaultView.style.display = "none";

  if (foundEvents.length > 0) {
    resultsView.style.display  = "block";
    noResultsView.style.display = "none";
    document.getElementById("resultsTitle").innerText = `תוצאות עבור: "${query}"`;
    injectCardsToResults(foundEvents);
  } else {
    resultsView.style.display  = "none";
    noResultsView.style.display = "block";
  }
}

/* ─── 6. עזרים לבניית פילטר ─────────────────────────────── */
function registerSmartQueue() {
  document.getElementById("queueSuccessModal").style.display = "flex";
}
function closeQueueModal() {
  document.getElementById("queueSuccessModal").style.display = "none";
  location.reload();
}

function createSectionHeader(title) {
  return `<div style="font-weight:800; margin-top:20px; margin-bottom:12px; color:#2d3436; border-bottom:1px solid #eee; padding-bottom:5px; font-size:15px;">${title}</div>`;
}

function createInput(label, type, ph = "") {
  return `<div class="filter-group"><label class="filter-label">${label}</label><input type="${type}" class="filter-input" placeholder="${ph}"></div>`;
}

function createLocationInput() {
  return `
    <div class="filter-group">
      <label class="filter-label">מיקום / אזור</label>
      <div style="position:relative; width:100%;">
        <input type="text" class="filter-input" placeholder="למשל: תל אביב והסביבה..." style="padding-left:40px;">
        <span class="material-symbols-rounded" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:22px; background:var(--brand-gradient); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">location_on</span>
      </div>
    </div>`;
}

function createDateRange(label) {
  return `<div class="filter-group"><label class="filter-label">${label}</label><div style="display:flex; gap:10px; align-items:center;"><input type="date" class="filter-input" style="flex:1"><span style="font-weight:bold; color:#ccc;">-</span><input type="date" class="filter-input" style="flex:1"></div></div>`;
}

function createRating(label) {
  return `<div class="filter-group"><label class="filter-label" style="margin-bottom:4px;">${label}</label><p style="font-size:12px; color:#999; margin:0 0 10px 0; line-height:1.4;">יוצגו רק כרטיסים ממוכרים עם דירוג זה ומעלה</p><div class="rating-stars" style="color:#ffd166; font-size:24px; cursor:pointer; display:flex; gap:5px;" id="filterRating"><i class="far fa-star" onclick="setRatingValue(1)"></i><i class="far fa-star" onclick="setRatingValue(2)"></i><i class="far fa-star" onclick="setRatingValue(3)"></i><i class="far fa-star" onclick="setRatingValue(4)"></i><i class="far fa-star" onclick="setRatingValue(5)"></i></div></div>`;
}

function setRatingValue(val) {
  const container = document.getElementById("filterRating");
  if (!container) return;
  container.querySelectorAll("i").forEach((star, index) => {
    star.classList.toggle("far", index >= val);
    star.classList.toggle("fas", index < val);
  });
}

function createCounter(id, label) {
  return `
    <div class="filter-group" style="display:flex; justify-content:space-between; align-items:center;">
      <label class="filter-label" style="margin-bottom:0;">${label}</label>
      <div style="display:flex; align-items:center; gap:15px; background:white; padding:5px 10px; border:1px solid #e0e0e0; border-radius:12px;">
        <button onclick="updateCounter(this, -1)" style="width:28px; height:28px; border:none; background:#f0f2f5; border-radius:8px; font-weight:bold; color:#2d3436; cursor:pointer;">-</button>
        <span style="font-weight:800; min-width:20px; text-align:center; font-size:16px;">1</span>
        <button onclick="updateCounter(this, 1)"  style="width:28px; height:28px; border:none; background:#f0f2f5; border-radius:8px; font-weight:bold; color:#2d3436; cursor:pointer;">+</button>
      </div>
    </div>`;
}

function updateCounter(btn, change) {
  const span = btn.parentElement.querySelector("span");
  let val = parseInt(span.innerText) + change;
  if (val < 1) val = 1;
  span.innerText = val;
}

function createChips(label, options) {
  const chipsHtml = options.map((opt) =>
    `<div class="chip-label" onclick="toggleChip(this)" style="border:1px solid #e0e0e0; padding:8px 14px; border-radius:20px; font-size:13px; font-weight:600; cursor:pointer; user-select:none;">${opt}</div>`
  ).join("");
  return `<div class="filter-group"><label class="filter-label">${label}</label><div class="chips-container" style="display:flex; flex-wrap:wrap; gap:8px;">${chipsHtml}</div></div>`;
}

function toggleChip(el) {
  el.classList.toggle("selected");
  if (el.classList.contains("selected")) {
    el.style.background    = "var(--brand-gradient)";
    el.style.color         = "white";
    el.style.borderColor   = "transparent";
  } else {
    el.style.background    = "white";
    el.style.color         = "var(--text-main)";
    el.style.borderColor   = "#e0e0e0";
  }
}

/* ─── 7. לב (מועדפים) ───────────────────────────────────── */
function toggleHeart(btn) {
  event.stopPropagation();
  const icon = btn.querySelector("span.material-symbols-rounded");
  const userId = localStorage.getItem("userId");
  const listingId = btn.dataset.id;
  if (!userId) { alert("יש להתחבר קודם"); return; }

  if (icon.innerText === "favorite") {
    icon.innerText = "favorite_border";
    icon.classList.remove("filled-icon");
    icon.style.color   = "#b2bec3";
    btn.style.background = "#f7f7f9";
    ajaxCall("DELETE", "/api/favorites/" + userId + "/" + listingId, null, function(){}, function(){
      icon.innerText = "favorite";
      icon.classList.add("filled-icon");
      icon.style.color   = "#FF4757";
      btn.style.background = "#FFF0F1";
      alert("שגיאה בעדכון המועדפים");
    });
  } else {
    icon.innerText = "favorite";
    icon.classList.add("filled-icon");
    icon.style.color   = "#FF4757";
    btn.style.background = "#FFF0F1";
    ajaxCall("POST", "/api/favorites", { userId: parseInt(userId), listingId: parseInt(listingId) }, function(){}, function(){
      icon.innerText = "favorite_border";
      icon.classList.remove("filled-icon");
      icon.style.color   = "#b2bec3";
      btn.style.background = "#f7f7f9";
      alert("שגיאה בעדכון המועדפים");
    });
  }
}

/* ─── 8. Sidebar + ניווט תחתון ─────────────────────────── */
function toggleMenu() {
  const menu    = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay");
  if (menu && overlay) {
    menu.classList.toggle("open");
    overlay.classList.toggle("show");
  }
}

function toggleAccordion() {
  document.getElementById("catAccordion").classList.toggle("open");
  document.getElementById("accIcon").classList.toggle("fa-rotate-180");
}

function activateNav(btn) {
  document.querySelectorAll(".bottom-nav .nav-item").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}
