// --- 1. לוגיקה לבחירת צ'יפים (תחומי עניין ואזורים) ---
function enableChipSelection(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const chips = container.querySelectorAll(".chip");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.value;

      // לוגיקה של "הכל" / "בכל הארץ"
      if (value === "הכל" || value === "בכל הארץ") {
        const isSelected = chip.classList.contains("selected");
        if (!isSelected) {
          chips.forEach((c) => c.classList.remove("selected"));
          chip.classList.add("selected");
        } else {
          chip.classList.remove("selected");
        }
        return;
      }

      // אם לוחצים על צ'יפ רגיל - מכבים את ה"הכל"
      chips.forEach((c) => {
        if (c.dataset.value === "הכל" || c.dataset.value === "בכל הארץ") {
          c.classList.remove("selected");
        }
      });

      chip.classList.toggle("selected");
    });
  });
}

enableChipSelection("areaChips");

// --- 2. לוגיקת סליידר תקציב ---

const inputMin    = document.getElementById("input-min");
const inputMax    = document.getElementById("input-max");
const sliderMin   = document.getElementById("slider-1");
const sliderMax   = document.getElementById("slider-2");
const sliderTrack = document.getElementById("sliderTrack");
const displayMin  = document.getElementById("displayMin");
const displayMax  = document.getElementById("displayMax");
const BUDGET_MAX  = 20000;
const minGap      = 50;

function autosizeInput(input) {
  if (!input) return;
  input.style.width = (String(input.value || "0").length + 0.5) + "ch";
}

function slideOne() {
  if (!sliderMin || !sliderMax) return;
  if (parseInt(sliderMax.value) - parseInt(sliderMin.value) < minGap) {
    sliderMin.value = parseInt(sliderMax.value) - minGap;
  }
  if (inputMin)   inputMin.value   = sliderMin.value;
  if (displayMin) { displayMin.value = sliderMin.value; autosizeInput(displayMin); }
  fillColor();
}

function slideTwo() {
  if (!sliderMin || !sliderMax) return;
  if (parseInt(sliderMax.value) - parseInt(sliderMin.value) < minGap) {
    sliderMax.value = parseInt(sliderMin.value) + minGap;
  }
  if (inputMax)   inputMax.value   = sliderMax.value;
  if (displayMax) { displayMax.value = sliderMax.value; autosizeInput(displayMax); }
  fillColor();
}

function fillColor() {
  if (!sliderTrack || !sliderMin || !sliderMax) return;
  const p1 = (parseInt(sliderMin.value) / BUDGET_MAX) * 100;
  const p2 = (parseInt(sliderMax.value) / BUDGET_MAX) * 100;
  sliderTrack.style.background =
    `linear-gradient(to right, #e0e0e0 ${p1}%, var(--primary-solid) ${p1}%, var(--primary-solid) ${p2}%, #e0e0e0 ${p2}%)`;
}

function selectBudgetByValues(min, max) {
  const safeMin = Math.max(0, Math.min(parseInt(min) || 0, BUDGET_MAX - minGap));
  const safeMax = Math.min(BUDGET_MAX, Math.max(parseInt(max) || BUDGET_MAX, safeMin + minGap));
  if (sliderMin)  sliderMin.value  = safeMin;
  if (sliderMax)  sliderMax.value  = safeMax;
  if (inputMin)   inputMin.value   = safeMin;
  if (inputMax)   inputMax.value   = safeMax;
  if (displayMin) { displayMin.value = safeMin; autosizeInput(displayMin); }
  if (displayMax) { displayMax.value = safeMax; autosizeInput(displayMax); }
  fillColor();
}

function setupBudgetInputs() {
  if (displayMin) {
    displayMin.addEventListener("input", function () { autosizeInput(this); });
    displayMin.addEventListener("change", function () {
      let v = Math.round((parseInt(this.value) || 0) / minGap) * minGap;
      v = Math.max(0, Math.min(v, parseInt(sliderMax ? sliderMax.value : BUDGET_MAX) - minGap));
      this.value = v;
      autosizeInput(this);
      if (sliderMin) sliderMin.value = v;
      if (inputMin)  inputMin.value  = v;
      fillColor();
    });
  }
  if (displayMax) {
    displayMax.addEventListener("input", function () { autosizeInput(this); });
    displayMax.addEventListener("change", function () {
      let v = Math.round((parseInt(this.value) || BUDGET_MAX) / minGap) * minGap;
      v = Math.min(BUDGET_MAX, Math.max(v, parseInt(sliderMin ? sliderMin.value : 0) + minGap));
      this.value = v;
      autosizeInput(this);
      if (sliderMax) sliderMax.value = v;
      if (inputMax)  inputMax.value  = v;
      fillColor();
    });
  }
}

setupBudgetInputs();

window.addEventListener("load", function () {
  if (sliderMin && sliderMax) fillColor();
  autosizeInput(displayMin);
  autosizeInput(displayMax);
});

// --- 3. לוגיקה לתור חכם (תגיות) ---
function addArtistTag() {
  const input     = document.getElementById("artistInput");
  const value     = input.value.trim();
  const container = document.getElementById("tagsContainer");

  if (value) {
    const existing = [...container.querySelectorAll(".smart-tag span")].map(s => s.textContent.trim());
    if (existing.includes(value)) { input.value = ""; input.focus(); return; }
    const tag = document.createElement("div");
    tag.className = "smart-tag slide-in";
    tag.innerHTML = `<span>${escapeHtml(value)}</span><i class="fas fa-times remove-tag" onclick="removeTag(this)"></i>`;
    container.appendChild(tag);
    input.value = "";
    input.focus();
  }
}

function removeTag(icon) {
  const tag = icon.parentElement;
  tag.style.opacity = "0";
  setTimeout(() => { tag.remove(); }, 200);
}

function handleEnter(e) {
  if (e.key === "Enter") addArtistTag();
}

// --- 4. טעינת העדפות בטעינת הדף ---
document.addEventListener("DOMContentLoaded", () => {
  const fromSignup = new URLSearchParams(window.location.search).get("fromSignup");
  if (fromSignup) {
    if (!sessionStorage.getItem("pendingSignup")) {
      window.location.href = "signup.html";
      return;
    }
    loadCategories();
  } else {
    if (!requireAuth()) return;
    const btn = document.getElementById("finishBtn");
    if (btn) btn.textContent = "שמור העדפות";
    loadPreferences();
  }
});

// --- 5. טעינת קטגוריות בלבד (מצב הרשמה) ---
let _categories = [];

function renderInterestChips() {
  const container = document.getElementById("interestChips");
  if (!container) return;
  container.querySelectorAll('.chip:not([data-value="הכל"])').forEach(c => c.remove());
  _categories.forEach(c => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.value = c.name;
    chip.textContent = c.name;
    container.appendChild(chip);
  });
  enableChipSelection("interestChips");
}

function loadCategories() {
  ajaxCall("GET", "/api/categories", null,
    function (cats) { _categories = cats; renderInterestChips(); },
    function () {}
  );
}

// --- 5ב. טעינת העדפות מה-API (משתמש קיים) ---
function loadPreferences() {
  const userId = localStorage.getItem("userId");

  ajaxCall("GET", "/api/categories", null,
    function (cats) {
      _categories = cats;
      renderInterestChips();

      ajaxCall("GET", "/api/preferences/" + userId, null,
        function (prefs) {
          // אזור גאו
          if (prefs.geoArea) {
            document.querySelectorAll("#areaChips .chip").forEach(c => {
              if (c.dataset.value === prefs.geoArea) c.classList.add("selected");
            });
          }

          // תקציב
          selectBudgetByValues(prefs.minBudget || 0, prefs.maxBudget || 20000);

          // נגישות
          const toggles = document.querySelectorAll(".toggles-list input[type='checkbox']");
          if (toggles[0]) toggles[0].checked = prefs.accessibilityWheelchair;
          if (toggles[1]) toggles[1].checked = prefs.accessibilityHearing;

          // ערוצי התראה
          const channels = document.querySelectorAll(".channels-row input[type='checkbox']");
          if (channels[0]) channels[0].checked = prefs.notificationPush;
          if (channels[1]) channels[1].checked = prefs.notificationSms;
          if (channels[2]) channels[2].checked = prefs.notificationEmail;

          // קטגוריות (chips לפי category_id)
          if (prefs.categoryIds && prefs.categoryIds.length > 0) {
            const selectedNames = _categories
              .filter(c => prefs.categoryIds.includes(c.categoryId))
              .map(c => c.name);
            document.querySelectorAll("#interestChips .chip").forEach(chip => {
              if (selectedNames.includes(chip.dataset.value)) chip.classList.add("selected");
            });
          }

          // מילות מפתח (טאגים)
          if (prefs.keywords && prefs.keywords.length > 0) {
            const container = document.getElementById("tagsContainer");
            if (container) {
              prefs.keywords.forEach(kw => {
                const tag = document.createElement("div");
                tag.className = "smart-tag slide-in";
                tag.innerHTML = `<span>${escapeHtml(kw)}</span><i class="fas fa-times remove-tag" onclick="removeTag(this)"></i>`;
                container.appendChild(tag);
              });
            }
          }
        },
        function () {}
      );
    },
    function () {}
  );
}

// --- 6. שמירת העדפות ל-API ---
function savePreferences() {
  const fromSignup = new URLSearchParams(window.location.search).get("fromSignup");
  const userId = localStorage.getItem("userId");

  if (!fromSignup && !userId) { window.location.href = "login.html"; return; }

  const selectedArea = document.querySelector("#areaChips .chip.selected");
  const geoArea = selectedArea ? selectedArea.dataset.value : null;

  const selectedInterests = [...document.querySelectorAll("#interestChips .chip.selected")]
    .map(c => c.dataset.value);
  const categoryIds = _categories
    .filter(c => selectedInterests.includes(c.name))
    .map(c => c.categoryId);

  const keywords = [...new Set(
    [...document.querySelectorAll("#tagsContainer .smart-tag span")]
      .map(s => s.textContent.trim())
      .filter(k => k.length > 0)
  )];

  const toggles  = document.querySelectorAll(".toggles-list input[type='checkbox']");
  const channels = document.querySelectorAll(".channels-row input[type='checkbox']");

  const prefs = {
    geoArea:                 geoArea,
    minBudget:               parseFloat(inputMin ? inputMin.value : 0),
    maxBudget:               parseFloat(inputMax ? inputMax.value : 20000),
    accessibilityWheelchair: toggles[0] ? toggles[0].checked : false,
    accessibilityHearing:    toggles[1] ? toggles[1].checked : false,
    notificationPush:        channels[0] ? channels[0].checked : true,
    notificationSms:         channels[1] ? channels[1].checked : false,
    notificationEmail:       channels[2] ? channels[2].checked : true,
    categoryIds:             categoryIds,
    keywords:                keywords
  };

  if (fromSignup) {
    const pending = JSON.parse(sessionStorage.getItem("pendingSignup") || "{}");
    if (!pending.email) {
      alert("פרטי ההרשמה לא נמצאו, אנא חזרי לדף ההרשמה");
      window.location.href = "signup.html";
      return;
    }
    ajaxCall("POST", "/api/auth/register", pending,
      function (res) {
        localStorage.setItem("userId", res.userId);
        localStorage.setItem("firstName", pending.firstName);
        sessionStorage.removeItem("pendingSignup");
        ajaxCall("PUT", "/api/preferences/" + res.userId, prefs,
          function () { window.location.href = "home.html"; },
          function () { window.location.href = "home.html"; }
        );
      },
      function (err) {
        if (err.status === 409) {
          alert("כתובת האימייל כבר קיימת במערכת, אנא חזרי לדף ההרשמה");
        } else {
          alert("שגיאה בהרשמה, נסי שוב");
        }
        window.location.href = "signup.html";
      }
    );
  } else {
    ajaxCall("PUT", "/api/preferences/" + userId, prefs,
      function () { window.location.href = "home.html"; },
      function () { alert("שגיאה בשמירת ההעדפות, נסי שוב"); }
    );
  }
}
