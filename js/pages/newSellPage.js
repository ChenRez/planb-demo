/* newSellPage.js — לוגיקת מסך יצירת מכירה חדשה (4 שלבים) */

let currentStep = 1;
let selectedCategory = "";
let selectedCategoryId = null;
let globalImageUrl = "";
let globalTicketPath = "";
let _previewDataUrl = "";

$(document).ready(function () {
  if (!requireAuth()) return;

  ajaxCall("GET", "/api/categories", null, renderCategoryGrid, function () {});

  var userId = localStorage.getItem("userId");
  if (userId) {
    ajaxCall("GET", "/api/users/" + userId, null,
      function (user) {
        var phoneInput = document.getElementById("phoneInputField");
        if (phoneInput && user && user.phone) phoneInput.value = user.phone;
      },
      function () {}
    );
  }

  frameOriginalPriceField();
  setupHebrewDatePicker();
});

// מסגור שדה "מחיר מקורי" כהצהרה (המחיר הנקוב המודפס על הכרטיס), לא כעובדה.
// נכון משפטית (האחריות על המוכר) ומבהיר שהתמחור החכם מצליב את ההצהרה מול מחירי הרשת.
function frameOriginalPriceField() {
  var origInput = _findOriginalPriceInput();
  if (!origInput) return;
  var group = origInput.closest(".input-group");
  if (!group) return;

  var label = group.querySelector(".section-header");
  if (label) label.textContent = " כמה עלה לך? (מחיר נקוב כפי שמופיע על הכרטיס, לכרטיס בודד)";
}

// שדה המחיר המקורי = ה-input המספרי הראשון ב-step4 שאינו #priceInput (תואם ל-_collectPriceOriginal)
function _findOriginalPriceInput() {
  var inputs = document.querySelectorAll("#step4 input[type='number']");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id !== "priceInput") return inputs[i];
  }
  return null;
}

// בורר תאריך בפורמט ישראלי (יום/חודש/שנה) עם שמות חודשים בעברית.
// מסתיר את ה-input המקורי (type=date) ומסנכרן אליו ערך YYYY-MM-DD כדי שכל הצרכנים הקיימים ימשיכו לעבוד.
function setupHebrewDatePicker() {
  var native = document.getElementById("dateInput");
  if (!native || document.getElementById("hebDateWrap")) return;
  native.style.display = "none";

  var months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

  function buildSelect(id, placeholder) {
    var sel = document.createElement("select");
    sel.id = id;
    sel.className = "styled-input";
    sel.innerHTML = '<option value="">' + placeholder + '</option>';
    return sel;
  }

  var daySel = buildSelect("hebDay", "יום");
  for (var d = 1; d <= 31; d++) daySel.innerHTML += '<option value="' + d + '">' + d + '</option>';

  var monthSel = buildSelect("hebMonth", "חודש");
  for (var m = 0; m < 12; m++) monthSel.innerHTML += '<option value="' + (m + 1) + '">' + months[m] + '</option>';

  var yearSel = buildSelect("hebYear", "שנה");
  var nowY = new Date().getFullYear();
  for (var y = nowY; y <= nowY + 2; y++) yearSel.innerHTML += '<option value="' + y + '">' + y + '</option>';

  var wrap = document.createElement("div");
  wrap.id = "hebDateWrap";
  wrap.className = "double-input-row";
  wrap.style.gap = "8px";
  wrap.appendChild(daySel);
  wrap.appendChild(monthSel);
  wrap.appendChild(yearSel);
  native.insertAdjacentElement("afterend", wrap);

  function sync() {
    var d = daySel.value, m = monthSel.value, y = yearSel.value;
    if (d && m && y) {
      var dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      if (dt.getDate() === parseInt(d) && dt.getMonth() === parseInt(m) - 1) {
        native.value = y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
      } else {
        native.value = "";
      }
    } else {
      native.value = "";
    }
    updatePreview();
  }
  daySel.addEventListener("change", sync);
  monthSel.addEventListener("change", sync);
  yearSel.addEventListener("change", sync);
}

// פורמט תאריך להצגה: YYYY-MM-DD -> DD/MM/YYYY
function formatDateIL(raw) {
  if (!raw) return "";
  var parts = String(raw).split("-");
  if (parts.length !== 3) return raw;
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function goToStep(step) {
  document.querySelectorAll(".progress-step").forEach((bar, index) => {
    if (index < step) bar.classList.add("active");
    else bar.classList.remove("active");
  });

  document.querySelectorAll(".screen-step").forEach((screen) => screen.classList.remove("active"));
  document.getElementById("step" + step).classList.add("active");

  const stepTitles = ["פרטים כלליים", "מילוי פרטים", "מדיה והוכחות", "תמחור וסיום"];
  document.getElementById("stepText").innerText = `שלב ${step} מתוך 4: ${stepTitles[step - 1]}`;
  document.getElementById("stepText").style.display = "block";
  document.getElementById("pageTitle").innerText = "יצירת מכירה";

  if (step === 2) handleDynamicSections();
  if (step === 4) updatePreview();
  currentStep = step;
}

function renderCategoryGrid(cats) {
  var grid = document.getElementById("categoriesGrid");
  if (!grid) return;
  grid.innerHTML = "";
  (cats || []).forEach(function (c) {
    var item = document.createElement("div");
    item.className = "cat-item";
    item.dataset.cat = c.name;
    item.dataset.catId = c.categoryId;

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
    item.addEventListener("click", function () { selectCategory(item); });
    grid.appendChild(item);
  });

  var first = grid.querySelector(".cat-item");
  if (first) selectCategory(first);
}

function selectCategory(el) {
  document.querySelectorAll(".cat-item").forEach((item) => {
    item.classList.remove("active");
    var c = item.querySelector(".cat-circle");
    if (c) c.classList.remove("active");
  });
  el.classList.add("active");
  var circle = el.querySelector(".cat-circle");
  if (circle) circle.classList.add("active");

  selectedCategory   = el.dataset.cat || "";
  selectedCategoryId = parseInt(el.dataset.catId) || null;

  const titleInput = document.getElementById("titleInput");
  let placeholder = "כותרת האירוע";
  switch (selectedCategory) {
    case "ספורט":   placeholder = "לדוגמה: מכבי תל אביב נגד הפועל בדרבי"; break;
    case "הופעות":  placeholder = "לדוגמה: עידן עמדי בקיסריה"; break;
    case "תיירות":  placeholder = "לדוגמה: לילות בצימר בגליל לזוג"; break;
    default:        placeholder = `לדוגמה: כרטיס ל${selectedCategory}`;
  }
  if (titleInput) titleInput.placeholder = placeholder;

  var unitLabels = {
    "הופעות": "לכרטיס בודד", "ספורט": "לכרטיס בודד",
    "קולנוע": "לכרטיס בודד", "הצגות": "לכרטיס בודד", "סטנדאפ": "לכרטיס בודד",
    "תיירות": "ללילה / לאדם", "אטרקציות": "לאדם",
    "שוברים": "לשובר", "פסטיבלים": "לכרטיס / לאדם"
  };
  var lbl = document.getElementById("priceUnitLabel");
  if (lbl) lbl.innerHTML = '<i class="fas fa-info-circle" style="color:var(--primary-solid)"></i> המחיר הוא ' + (unitLabels[selectedCategory] || 'ליחידה');
}

function selectOne(el) {
  el.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
}

function toggleSelect(el) {
  el.classList.toggle("selected");
}

function selectPaymentMethod(el) {
  document.querySelectorAll(".pay-method-container").forEach((opt) => opt.classList.remove("selected"));
  el.classList.add("selected");

  var label = el.querySelector(".pay-label").innerText.trim();
  var phoneContainer = document.getElementById("paymentPhoneContainer");
  var bankContainer  = document.getElementById("bankSummaryContainer");
  var labelText      = document.getElementById("payPhoneLabel");
  var phoneInput     = document.getElementById("phoneInputField");

  phoneContainer.style.display = "none";
  bankContainer.style.display  = "none";

  if (label === "Bit" || label === "PayBox") {
    phoneContainer.style.display = "block";
    labelText.innerText = "מספר הטלפון ל-" + label;
    if (phoneInput && !phoneInput.value) {
      var userId = localStorage.getItem("userId");
      if (userId) {
        ajaxCall("GET", "/api/users/" + userId, null,
          function (user) { if (user && user.phone) phoneInput.value = user.phone; },
          function () {}
        );
      }
    }
  } else if (label === "לחשבון המוגדר") {
    bankContainer.style.display = "block";
    var bankInfo = document.getElementById("bankInfo");
    bankInfo.innerHTML = '<span style="color:#909090;">טוען...</span>';
    var userId = localStorage.getItem("userId");
    if (userId) {
      ajaxCall("GET", "/api/users/" + userId + "/bank", null,
        function (bank) {
          if (bank && bank.bankName && bank.accountNumber) {
            var last4 = String(bank.accountNumber).slice(-4);
            bankInfo.innerHTML = '<i class="fas fa-university" style="color:var(--primary-solid); margin-left:8px;"></i>' +
              '<strong>' + bank.bankName + '</strong> &mdash; חשבון XXXX' + last4 +
              ' &nbsp;<a href="profile.html" style="font-size:11px; color:var(--primary-solid); font-weight:700;">שנה</a>';
          } else {
            bankInfo.innerHTML = '<span style="color:#909090;">לא הוגדר חשבון בנק. <a href="profile.html" style="color:var(--primary-solid);">הגדר בפרופיל</a></span>';
          }
        },
        function () { bankInfo.innerHTML = '<span style="color:#909090;">שגיאה בטעינת פרטי הבנק</span>'; }
      );
    }
  }
}

function handleTicketUpload(input) {
  if (!(input.files && input.files[0])) return;
  const file = input.files[0];
  const fileName = file.name;
  const box = document.getElementById("ticketUploadBox");
  const icon = document.getElementById("ticketIcon");
  const text = document.getElementById("ticketText");

  text.innerHTML = "<strong>מעלה...</strong>";

  var formData = new FormData();
  formData.append("file", file);
  ajaxCall("POST", "/api/listings/upload-ticket", formData,
    function (res) {
      globalTicketPath = res.path;

      box.style.borderColor = "#2ecc71";
      box.style.backgroundColor = "#f0fdf4";
      icon.classList.remove("fa-file-pdf");
      icon.classList.add("fa-check-circle");
      icon.style.color = "#2ecc71";
      icon.style.background = "none";
      icon.style.webkitTextFillColor = "initial";

      text.innerHTML = `<strong>הקובץ הועלה!</strong><br><span style="font-size:11px;">${fileName}</span>`;
      text.style.background = "none";
      text.style.webkitTextFillColor = "initial";
      text.style.color = "#2d3436";
    },
    function (xhr) {
      globalTicketPath = "";
      input.value = "";
      var msg = (xhr && xhr.responseJSON && xhr.responseJSON.message) || "העלאת הקובץ נכשלה";
      text.innerHTML = `<strong>${msg}</strong>`;
    }
  );
}

// מיפוי קטגוריה → תמונה גנרית (קובץ מנוהל-git שמגיע גם לשרת רופין)
const CATEGORY_GENERIC_IMG = {
  1: "/img/categories/1.png", // הופעות
  2: "/img/categories/2.png", // ספורט
  3: "/img/categories/3.png", // תיירות/חופשות
  4: "/img/categories/4.png", // שוברים
  5: "/img/categories/5.png", // סטנדאפ
  6: "/img/categories/6.png", // אטרקציות
  7: "/img/categories/7.png", // הצגות
  8: "/img/categories/8.png", // קולנוע
  9: "/img/categories/9.png", // פסטיבלים
};

// אם התמונה (למשל תוצאת חיפוש מ-host חוסם) לא נטענת — נופלים לתמונה גנרית של הקטגוריה, לא ללוגו.
function onMainImageError(img) {
  img.onerror = null;
  const generic = CATEGORY_GENERIC_IMG[selectedCategoryId];
  if (generic) {
    globalImageUrl = generic;
    _previewDataUrl = "";
    img.src = mediaUrl(generic);
    setAiButtonDone("נוספה תמונה גנרית לקטגוריה");
    showAiImageActions("התמונה שנמצאה לא נטענה — נבחרה תמונה גנרית של הקטגוריה.");
    updatePreview();
  }
}

function renderMainImage(url) {
  const mainBox = document.getElementById("mainImageArea");
  const img = document.createElement("img");
  img.src = mediaUrl(url);
  img.onerror = function () { onMainImageError(img); };
  img.style.cssText = "width:100%; height:100%; object-fit:cover; border-radius:18px;";
  mainBox.innerHTML = "";
  mainBox.appendChild(img);
  mainBox.style.padding = "0";
  mainBox.style.border = "none";
  mainBox.style.overflow = "hidden";
}

function setAiButtonDone(text) {
  const btn = document.getElementById("aiBtn");
  btn.innerHTML = '<i class="fas fa-check"></i> ' + text;
  btn.style.backgroundColor = "#d1fae5";
  btn.style.color = "#065f46";
  btn.style.borderColor = "transparent";
  btn.disabled = false;
}

// יוצר/מציג את שורת הפעולות (תמונה גנרית) באופן דינמי מתחת לכפתור ה-AI
function showAiImageActions(hint) {
  const btn = document.getElementById("aiBtn");
  let box = document.getElementById("aiImageActions");
  if (!box) {
    box = document.createElement("div");
    box.id = "aiImageActions";
    box.style.cssText = "margin-top:10px; text-align:center;";
    box.innerHTML =
      '<p id="aiImageHint" style="font-size:12px; color:#909090; margin:0 0 8px;"></p>' +
      '<button class="ai-search-btn" type="button" id="useGenericBtn" ' +
      'style="background:#f3f4f6; color:#374151; border:1px solid #e5e7eb;" ' +
      'onclick="useGenericImage()"><i class="fas fa-image"></i> ' +
      "התמונה לא קשורה? השתמש בתמונה גנרית של הקטגוריה</button>";
    btn.parentNode.insertBefore(box, btn.nextSibling);
  }
  document.getElementById("aiImageHint").textContent = hint || "";
  box.style.display = "block";
}

// תמונה גנרית לפי הקטגוריה שנבחרה (רשת ביטחון אם החיפוש לא קלע)
function useGenericImage() {
  const url = CATEGORY_GENERIC_IMG[selectedCategoryId];
  if (!url) {
    showToast("בחרי קטגוריה תחילה כדי לקבל תמונה גנרית מתאימה.");
    return;
  }
  globalImageUrl = url;
  _previewDataUrl = "";
  renderMainImage(url);
  setAiButtonDone("נוספה תמונה גנרית לקטגוריה");
  document.getElementById("aiImageHint").textContent =
    "נבחרה תמונה גנרית של הקטגוריה. תמיד אפשר להעלות תמונה משלך.";
  updatePreview();
}

function findAIImage() {
  const title = (document.getElementById("titleInput").value || "").trim();
  if (!title) {
    showToast("מלאי כותרת למודעה כדי שנחפש תמונה מתאימה.");
    return;
  }

  const btn = document.getElementById("aiBtn");
  const original = btn.innerHTML;
  btn.innerHTML = '<div class="spinner-small"></div> מחפש תמונה...';
  btn.disabled = true;

  const payload = {
    categoryId: selectedCategoryId || 0,
    categoryName: selectedCategory || "",
    title: title,
    location: (document.getElementById("locationInput").value || "").trim(),
  };

  suggestImage(
    payload,
    function (res) {
      if (res && res.imageUrl) {
        globalImageUrl = res.imageUrl;
        _previewDataUrl = "";
        renderMainImage(res.imageUrl);
        setAiButtonDone("נמצאה תמונה!");
        showAiImageActions("מצאנו תמונה לפי הכותרת. לא קשור?");
      } else {
        // לא נמצאה תמונה (אין מפתח/אין תוצאה) → מציעים גנרית מיד
        btn.innerHTML = original;
        btn.disabled = false;
        showAiImageActions("לא מצאנו תמונה מתאימה ברשת.");
      }
      updatePreview();
    },
    function () {
      btn.innerHTML = original;
      btn.disabled = false;
      showAiImageActions("החיפוש נכשל כרגע.");
    }
  );
}

function handleMainImageUpload(input) {
  if (input.files && input.files[0]) {
    var file = input.files[0];
    var mainBox = document.getElementById("mainImageArea");
    var originalHtml = mainBox.innerHTML;

    var reader = new FileReader();
    reader.onload = function (e) {
      _previewDataUrl = e.target.result;
      mainBox.innerHTML = '<img src="' + _previewDataUrl + '" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">';
      mainBox.style.padding = "0";
      mainBox.style.border = "none";
      mainBox.style.overflow = "hidden";
      updatePreview();
    };
    reader.readAsDataURL(file);

    var formData = new FormData();
    formData.append("file", file);
    ajaxCall("POST", "/api/listings/upload-image", formData,
      function (res) { globalImageUrl = res.url; },
      function (xhr) {
        globalImageUrl = "";
        _previewDataUrl = "";
        input.value = "";
        mainBox.innerHTML = originalHtml;
        mainBox.style.padding = "";
        mainBox.style.border = "";
        mainBox.style.overflow = "";
        updatePreview();
        showToast((xhr.responseJSON && xhr.responseJSON.message) || "העלאת התמונה נכשלה, נסי שוב");
      }
    );
  }
}

function updatePreview() {
  const title    = document.getElementById("titleInput").value    || "כותרת המודעה שלך...";
  const location = document.getElementById("locationInput").value || "מיקום";
  const dateRaw  = formatDateIL(document.getElementById("dateInput").value);
  const price    = document.getElementById("priceInput").value    || "0";

  document.getElementById("prevTitle").innerText    = title;
  document.getElementById("prevLocation").innerText = location;
  document.getElementById("prevPrice").innerText    = price + "₪";
  document.getElementById("prevDate").innerText     = dateRaw || "תאריך";
  document.querySelector(".preview-badge").innerText = selectedCategory;

  const img         = document.getElementById("finalPreviewImg");
  const placeholder = document.getElementById("placeholderPreview");

  var displayUrl = _previewDataUrl || globalImageUrl;
  if (displayUrl) {
    img.onerror = function () {
      img.onerror = null;
      const generic = CATEGORY_GENERIC_IMG[selectedCategoryId];
      if (generic) img.src = mediaUrl(generic);
    };
    img.src = mediaUrl(displayUrl);
    img.style.display = "block";
    placeholder.style.display = "none";
  } else {
    img.style.display = "none";
    placeholder.style.display = "flex";
  }
}

function handleDynamicSections() {
  document.querySelectorAll(".dynamic-section").forEach((sec) => (sec.style.display = "none"));
  document.getElementById("dateTimeRow").style.display = "flex";

  switch (selectedCategory) {
    case "ספורט":
      document.getElementById("SEC_SPORT").style.display = "block";
      break;
    case "הופעות":
    case "קולנוע":
    case "הצגות":
    case "סטנדאפ":
      document.getElementById("SEC_SEATS").style.display = "block";
      ensureSeatingTypeUI();
      applySeatingTypeState();
      break;
    case "תיירות":
      document.getElementById("SEC_TOURISM").style.display = "block";
      break;
    case "אטרקציות":
      document.getElementById("SEC_ATTRACTIONS").style.display = "block";
      ensureValidUntilUI("SEC_ATTRACTIONS", "validUntilAttractions");
      break;
    case "שוברים":
      document.getElementById("SEC_VOUCHERS").style.display = "block";
      ensureValidUntilUI("SEC_VOUCHERS", "validUntilVouchers");
      break;
    case "פסטיבלים":
      document.getElementById("SEC_FESTIVALS").style.display = "block";
      ensureFestivalRangeUI();
      break;
  }
}

// בורר תאריך עברי (יום/חודש/שנה) לשימוש חוזר בשדות דינמיים. מחזיר div עם 3 selects.
function makeHebrewDateField() {
  var months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  var wrap = document.createElement("div");
  wrap.className = "double-input-row";
  wrap.style.gap = "8px";
  function mk(ph, fill) {
    var sel = document.createElement("select");
    sel.className = "styled-input";
    sel.innerHTML = '<option value="">' + ph + '</option>';
    fill(sel);
    return sel;
  }
  wrap.appendChild(mk("יום",   function (s) { for (var d = 1; d <= 31; d++) s.innerHTML += '<option value="' + d + '">' + d + '</option>'; }));
  wrap.appendChild(mk("חודש",  function (s) { for (var m = 0; m < 12; m++) s.innerHTML += '<option value="' + (m + 1) + '">' + months[m] + '</option>'; }));
  var nowY = new Date().getFullYear();
  wrap.appendChild(mk("שנה",   function (s) { for (var y = nowY; y <= nowY + 2; y++) s.innerHTML += '<option value="' + y + '">' + y + '</option>'; }));
  return wrap;
}

// קורא ערך YYYY-MM-DD מתוך 3 ה-selects של makeHebrewDateField (או null אם חסר/לא תקין)
function readHebrewDateValue(wrapEl) {
  if (!wrapEl) return null;
  var sels = wrapEl.querySelectorAll("select");
  if (sels.length < 3) return null;
  var d = sels[0].value, m = sels[1].value, y = sels[2].value;
  if (d && m && y) {
    var dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    if (dt.getDate() === parseInt(d) && dt.getMonth() === parseInt(m) - 1) {
      return y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
    }
  }
  return null;
}

// סוג מקום (הופעות/קולנוע/הצגות/סטנדאפ): chips מעל מילוי שורה/כיסא
function ensureSeatingTypeUI() {
  var sec = document.getElementById("SEC_SEATS");
  if (!sec || document.getElementById("seatTypeChips")) return;
  var firstHeader = sec.querySelector(".section-header");

  var label = document.createElement("span");
  label.className = "section-header";
  label.textContent = "סוג מקום";

  var chips = document.createElement("div");
  chips.className = "chips-container";
  chips.id = "seatTypeChips";
  chips.style.marginBottom = "12px";
  ["כיסא ממוספר", "ישיבה חופשית", "עמידה", "יציע כללי", "אחר"].forEach(function (t, i) {
    var chip = document.createElement("div");
    chip.className = "chip" + (i === 0 ? " selected" : "");
    chip.textContent = t;
    chip.addEventListener("click", function () { selectSeatingType(chip); });
    chips.appendChild(chip);
  });

  sec.insertBefore(chips, firstHeader);
  sec.insertBefore(label, chips);
}

function selectSeatingType(chip) {
  document.querySelectorAll("#seatTypeChips .chip").forEach(function (c) { c.classList.remove("selected"); });
  chip.classList.add("selected");
  applySeatingTypeState();
}

// מציג מילוי שורה/כיסא רק עבור "כיסא ממוספר"; אחרת מסתיר ומנקה
function applySeatingTypeState() {
  var sel = document.querySelector("#seatTypeChips .chip.selected");
  var type = sel ? sel.textContent.trim() : "כיסא ממוספר";
  var seatsContainer = document.getElementById("seatsContainer");
  var seatsHeader = document.getElementById("seatsHeader");
  if (type === "כיסא ממוספר") {
    seatsContainer.style.display = "block";
    if (seatsHeader) seatsHeader.style.display = "block";
    generateSeatsInputs();
  } else {
    seatsContainer.style.display = "none";
    seatsContainer.innerHTML = "";
    if (seatsHeader) seatsHeader.style.display = "none";
  }
}

// פסטיבלים: בורר "יום בודד / טווח תאריכים" + תאריך סיום
function ensureFestivalRangeUI() {
  var sec = document.getElementById("SEC_FESTIVALS");
  if (!sec || document.getElementById("festDateMode")) return;

  var label = document.createElement("span");
  label.className = "section-header";
  label.style.marginTop = "12px";
  label.textContent = "משך הפסטיבל";

  var chips = document.createElement("div");
  chips.className = "chips-container";
  chips.id = "festDateMode";
  ["יום בודד", "טווח תאריכים"].forEach(function (t, i) {
    var chip = document.createElement("div");
    chip.className = "chip" + (i === 0 ? " selected" : "");
    chip.textContent = t;
    chip.addEventListener("click", function () { selectFestivalDateMode(chip); });
    chips.appendChild(chip);
  });

  var group = document.createElement("div");
  group.className = "input-group";
  group.id = "festEndWrap";
  group.style.marginTop = "10px";
  group.style.display = "none";
  var endLabel = document.createElement("span");
  endLabel.className = "section-header";
  endLabel.style.marginBottom = "5px";
  endLabel.textContent = "תאריך סיום";
  var field = makeHebrewDateField();
  field.id = "festEndDate";
  group.appendChild(endLabel);
  group.appendChild(field);

  sec.appendChild(label);
  sec.appendChild(chips);
  sec.appendChild(group);
}

function selectFestivalDateMode(chip) {
  document.querySelectorAll("#festDateMode .chip").forEach(function (c) { c.classList.remove("selected"); });
  chip.classList.add("selected");
  var range = chip.textContent.trim() === "טווח תאריכים";
  document.getElementById("festEndWrap").style.display = range ? "block" : "none";
}

// שוברים/אטרקציות: שדה "בתוקף עד" (אופציונלי)
function ensureValidUntilUI(sectionId, wrapId) {
  var sec = document.getElementById(sectionId);
  if (!sec || document.getElementById(wrapId)) return;
  var group = document.createElement("div");
  group.className = "input-group";
  group.style.marginTop = "12px";
  var label = document.createElement("span");
  label.className = "section-header";
  label.style.marginBottom = "5px";
  label.textContent = "בתוקף עד (לא חובה)";
  var field = makeHebrewDateField();
  field.id = wrapId;
  group.appendChild(label);
  group.appendChild(field);
  sec.appendChild(group);
}

// איסוף השדות הדינמיים החדשים לפי הקטגוריה הפעילה
function _collectCategoryExtras(listing) {
  var seatsSec = document.getElementById("SEC_SEATS");
  if (seatsSec && seatsSec.style.display === "block") {
    var seatSel = document.querySelector("#seatTypeChips .chip.selected");
    if (seatSel) listing.seatingType = seatSel.textContent.trim();
  }

  var festSec = document.getElementById("SEC_FESTIVALS");
  if (festSec && festSec.style.display === "block") {
    var mode = document.querySelector("#festDateMode .chip.selected");
    if (mode && mode.textContent.trim() === "טווח תאריכים") {
      listing.eventEndDate = readHebrewDateValue(document.getElementById("festEndDate"));
    }
  }

  if (document.getElementById("SEC_VOUCHERS").style.display === "block") {
    listing.validUntil = readHebrewDateValue(document.getElementById("validUntilVouchers"));
  } else if (document.getElementById("SEC_ATTRACTIONS").style.display === "block") {
    listing.validUntil = readHebrewDateValue(document.getElementById("validUntilAttractions"));
  }
}

function generateSeatsInputs() {
  const qty = document.getElementById("qtyInput").value || 1;
  const container = document.getElementById("seatsContainer");
  container.innerHTML = "";
  for (let i = 1; i <= qty; i++) {
    container.innerHTML += `
      <div style="margin-bottom: 10px; border-bottom:1px dashed #eee; padding-bottom:10px;">
        <span style="font-size:12px; color:#999;">כרטיס ${i}</span>
        <div class="double-input-row">
          <input type="text" class="styled-input" placeholder="שורה">
          <input type="text" class="styled-input" placeholder="כיסא">
        </div>
      </div>`;
  }
}

function limitTimeInput(el, max) {
  if (el.value > max) el.value = max;
  if (el.value.length > 2) el.value = el.value.slice(0, 2);
}

function handleAIPricing() {
  const btn           = document.getElementById("aiPriceBtn");
  const resultArea    = document.getElementById("aiResultArea");
  const loader        = document.getElementById("aiLoader");
  const loaderText    = document.getElementById("aiLoaderText");
  const recommendation = document.getElementById("aiRecommendation");
  const textContent   = document.getElementById("aiTextContent");

  btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> מעבד נתונים...`;
  btn.style.opacity = "0.7";
  btn.disabled = true;

  resultArea.style.display = "block";
  loader.style.display = "flex";
  recommendation.style.display = "none";
  loaderText.innerText = "בודקים מחירים של פריטים דומים...";

  const qtyNum = parseInt(document.getElementById("qtyInput").value) || 1;
  const title  = document.getElementById("titleInput").value.trim();

  if (!title) {
    resetAIPriceButton(btn);
    resultArea.style.display = "none";
    showToast("נא להזין כותרת לאירוע לפני תמחור חכם");
    return;
  }
  if (!selectedCategoryId) {
    resetAIPriceButton(btn);
    resultArea.style.display = "none";
    showToast("נא לבחור קטגוריה לפני תמחור חכם");
    return;
  }

  setTimeout(() => { if (loader.style.display !== "none") loaderText.innerText = "מחפשים נתונים ברשת ומנתחים ביקוש..."; }, 1500);
  setTimeout(() => { if (loader.style.display !== "none") loaderText.innerText = "מנתחים פופולריות וביקוש לאירוע..."; }, 9000);
  setTimeout(() => { if (loader.style.display !== "none") loaderText.innerText = "עוד רגע, מסכמים את ההמלצה..."; }, 20000);

  var payload = {
    categoryId:    selectedCategoryId,
    categoryName:  selectedCategory,
    title:         title,
    eventDate:     document.getElementById("dateInput").value || null,
    quantity:      qtyNum,
    priceOriginal: _collectPriceOriginal(),
    location:      document.getElementById("locationInput").value || null
  };

  suggestPrice(payload,
    function (res) {
      loader.style.display = "none";
      recommendation.style.display = "block";
      renderAIPriceResult(res, qtyNum, title, textContent);
      btn.innerHTML = `<i class="fas fa-check"></i> התמחור בוצע`;
      btn.style.backgroundColor = "#fff0f1";
      btn.style.color = "#ff4757";
      btn.style.opacity = "1";
      btn.disabled = false;
    },
    function () {
      loader.style.display = "none";
      recommendation.style.display = "block";
      textContent.innerHTML = `<span style="color:#ff4757;">לא הצלחנו להפיק המלצת מחיר כרגע. נסי שוב או הזיני מחיר ידנית.</span>`;
      resetAIPriceButton(btn);
    }
  );
}

function renderAIPriceResult(res, qty, title, textContent) {
  var perTicket = (res && res.pricePerTicket != null) ? res.pricePerTicket : null;
  var total     = (res && res.totalPrice != null) ? res.totalPrice : null;
  window._aiSuggestedPerTicket = perTicket;
  var applyBtn  = document.querySelector(".apply-price-btn");

  // אין המלצת מחיר (לא נמצא מספיק מידע) → הודעה חיננית בלבד, ללא כפתור החלה
  if (perTicket == null) {
    if (applyBtn) applyBtn.style.display = "none";
    var msg = (res && res.explanation)
      ? res.explanation
      : "לא מצאנו מספיק מידע ברשת על הפריט הזה כדי להמליץ על מחיר. נסי להזין מחיר ידנית.";
    var noData = `<span style="display:block; font-size:14px; color:#636e72; font-weight:500; line-height:1.6;">
        <i class="fas fa-circle-info" style="color:#b2bec3; margin-left:6px;"></i>${escapeText(msg)}
      </span>`;
    var noDataDomsHtml = aiSourcesHtml(res && res.sources);
    if (noDataDomsHtml) {
      noData += `<span style="display:block; margin-top:10px; font-size:11px; color:#999; border-top:1px solid #eee; padding-top:8px;">מקורות שנבדקו: ${noDataDomsHtml}</span>`;
    }
    textContent.innerHTML = noData;
    return;
  }

  if (applyBtn) applyBtn.style.display = "";

  var isSingle = !(qty > 1);
  var html = isSingle
    ? `המחיר המומלץ ל<strong>${escapeText(title)}</strong>:`
    : `המחיר המומלץ לכרטיס בודד ל<strong>${escapeText(title)}</strong>:`;
  html += `<br><span style="font-size:24px; color:#2d3436; font-weight:800; line-height:1.5;">${perTicket} ₪</span>`;
  html += ` <span style="font-size:14px; font-weight:600;">${isSingle ? "לכרטיס בודד" : "לכרטיס"}</span>`;
  if (total != null && qty > 1) html += `<br><span style="font-size:13px; color:#777; font-weight:500;">סה"כ ${total} ₪ עבור ${qty} כרטיסים</span>`;

  // תגית "אזל / ביקוש גבוה" — מוצגת רק כשהיא מבוססת ראיות (מקור מהרשת + רמת ביטחון),
  // ולא כברירת מחדל. מונע טענת ביקוש שקרית על פריטים גנריים (סדנאות/שוברים).
  var hasSources = !!(res && res.sources && res.sources.length > 0);
  if (res && res.soldOut === "yes" && hasSources && res.confidence === "high")
    html += `<br><span style="display:inline-block; margin-top:6px; font-size:12px; color:#e67e22; font-weight:700;"><i class="fas fa-triangle-exclamation"></i> נמצא שהאירוע אזל / ביקוש גבוה</span>`;

  var domsHtml = aiSourcesHtml(res && res.sources);
  var inner = "";
  if (res && res.explanation)
    inner += `<span style="display:block; font-size:13px; color:#555; font-weight:400; line-height:1.6;">${escapeText(res.explanation)}</span>`;
  if (domsHtml)
    inner += `<span style="display:block; margin-top:8px; font-size:12px; color:#999;"><i class="fas fa-globe" style="margin-left:5px; color:#b2bec3;"></i>מבוסס על מקורות מהרשת: ${domsHtml}</span>`;
  if (res && res.source === "fallback")
    inner += `<span style="display:block; margin-top:8px; font-size:11px; color:#b2bec3;">המלצה מבוססת נתוני הפלטפורמה (ללא נתוני רשת חיים).</span>`;

  if (inner) {
    html += `<div style="margin-top:12px;">
        <span onclick="var d=document.getElementById('aiReasoning'); var o=d.style.display==='none'; d.style.display=o?'block':'none'; var c=this.querySelector('.ai-chev'); if(c)c.textContent=o?'▴':'▾';" style="cursor:pointer; font-size:13px; color:#ff4757; font-weight:700; user-select:none;">
          <i class="fas fa-circle-question" style="margin-left:6px;"></i>רוצה לדעת איך החלטתי על המחיר? <span class="ai-chev">▾</span>
        </span>
        <div id="aiReasoning" style="display:none; margin-top:8px; background:#fafafa; border:1px solid #f0f0f0; border-radius:12px; padding:12px;">${inner}</div>
      </div>`;
  }

  textContent.innerHTML = html;
}

// מקורות ייחודיים לפי שם דומיין נקי (עד 5), כולל קישור אם קיים
function aiSourceDomains(sources) {
  if (!sources || !sources.length) return [];
  var map = {}, order = [];
  for (var i = 0; i < sources.length; i++) {
    var raw = sources[i] || {};
    var d = (raw.title ? raw.title : "")
      .replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").trim();
    if (!d) continue;
    if (!(d in map)) { map[d] = raw.uri || ""; order.push(d); }
    else if (!map[d] && raw.uri) { map[d] = raw.uri; } // מעדיפים רשומה עם קישור אמיתי
  }
  return order.slice(0, 5).map(function (d) { return { domain: d, uri: map[d] }; });
}

// HTML של רשימת המקורות — שם דומיין נקי, וכקישור (טאב חדש) כשיש URL
function aiSourcesHtml(sources) {
  var arr = aiSourceDomains(sources);
  if (!arr.length) return "";
  var sep = '<span style="color:#ccc;">  ·  </span>';
  return arr.map(function (s) {
    if (s.uri) return `<a href="${encodeURI(s.uri)}" target="_blank" rel="noopener noreferrer" style="color:#3498db; text-decoration:none;">${escapeText(s.domain)}</a>`;
    return `<span>${escapeText(s.domain)}</span>`;
  }).join(sep);
}

function resetAIPriceButton(btn) {
  btn.innerHTML = `<i class="fas fa-wand-magic-sparkles"></i> עזרו לי לתמחר חכם`;
  btn.style.opacity = "1";
  btn.disabled = false;
}

function escapeText(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function applyAIPrice() {
  if (window._aiSuggestedPerTicket != null) {
    document.getElementById("priceInput").value = window._aiSuggestedPerTicket;
    updatePreview();
  } else {
    showToast("אין מחיר מומלץ זמין. הריצי תמחור חכם תחילה.");
  }
}

function _collectTransferType() {
  var sel = document.querySelector("#step1 .chips-container .chip.selected");
  if (!sel) return "code";
  var t = sel.textContent.trim();
  if (t.indexOf("פיזי") !== -1) return "physical";
  if (t.indexOf("בעלות") !== -1) return "ownership";
  return "code";
}

function _collectEventTime() {
  var parts = document.querySelectorAll(".time-custom-wrapper .time-part");
  if (parts.length < 2) return null;
  var hh = parts[0].value, mm = parts[1].value;
  if (hh === "" && mm === "") return null;
  hh = ("0" + (hh || "0")).slice(-2);
  mm = ("0" + (mm || "0")).slice(-2);
  return hh + ":" + mm + ":00";
}

function _collectPriceOriginal() {
  var inputs = document.querySelectorAll("#step4 input[type='number']");
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].id !== "priceInput") {
      var v = parseFloat(inputs[i].value);
      return isNaN(v) ? null : v;
    }
  }
  return null;
}

function _collectNotes() {
  var parts = [];
  var why = document.querySelector("#step2 textarea");
  if (why && why.value.trim()) parts.push(why.value.trim());
  var buyer = document.querySelector("#step3 textarea");
  if (buyer && buyer.value.trim()) parts.push("הערות חשובות לקונה: " + buyer.value.trim());
  return parts.length ? parts.join("\n") : null;
}

function _collectSectionFields(listing) {
  if (selectedCategory === "ספורט") {
    var sp = document.querySelectorAll("#SEC_SPORT input");
    if (sp[0] && sp[0].value.trim()) listing.homeGroup  = sp[0].value.trim();
    if (sp[1] && sp[1].value.trim()) listing.awayGroup  = sp[1].value.trim();
    if (sp[2] && sp[2].value.trim()) listing.sectorSeat = sp[2].value.trim();
    return;
  }
  var seatsSec = document.getElementById("SEC_SEATS");
  if (seatsSec && seatsSec.style.display === "block") {
    var seatInputs = document.querySelectorAll("#seatsContainer input");
    var seats = [];
    for (var s = 0; s + 1 < seatInputs.length; s += 2) {
      var row = seatInputs[s].value.trim();
      var num = seatInputs[s + 1].value.trim();
      if (row || num) {
        seats.push(((row ? "שורה " + row : "") + (num ? " כיסא " + num : "")).trim());
      }
    }
    if (seats.length) listing.sectorSeat = seats.join(", ");
  }
}

function finishSale() {
  var title = document.getElementById("titleInput").value.trim();
  var price = parseFloat(document.getElementById("priceInput").value) || 0;
  var date  = document.getElementById("dateInput").value;

  if (!title) {
    showToast("נא להזין כותרת להמודעה");
    return;
  }
  if (!date) {
    showToast("נא לבחור תאריך לאירוע");
    return;
  }
  if (price <= 0) {
    showToast("נא להזין מחיר תקין");
    return;
  }
  if (!selectedCategoryId) {
    showToast("נא לבחור קטגוריה");
    return;
  }

  var listing = {
    sellerId:       parseInt(localStorage.getItem("userId")),  
    categoryId:     selectedCategoryId,
    title:          title,
    quantity:       parseInt(document.getElementById("qtyInput").value) || 1,
    eventDate:      date,
    eventTime:      _collectEventTime(),
    location:       document.getElementById("locationInput").value,
    priceOriginal:  _collectPriceOriginal(),
    priceRequested: price,
    transferType:   _collectTransferType(),
    imagePath:      globalImageUrl || null,
    ticketFilePath: globalTicketPath || null,
    notes:          _collectNotes(),
    homeGroup:      null,
    awayGroup:      null,
    sectorSeat:     null,
    eventEndDate:   null,
    validUntil:     null,
    seatingType:    null
  };

  _collectSectionFields(listing);
  _collectCategoryExtras(listing);

  var userId = localStorage.getItem("userId");
  ajaxCall("POST", "/api/listings?userId=" + encodeURIComponent(userId), listing, finishSaleSuccess, finishSaleError);
}

function finishSaleSuccess(data) {
  document.getElementById("finalTitle").innerText = document.getElementById("titleInput").value || "הפרסום שלך";
  document.getElementById("finalPrice").innerText = (document.getElementById("priceInput").value || "0") + " ₪";

  document.querySelectorAll(".screen-step").forEach(function (screen) { screen.classList.remove("active"); });
  document.getElementById("stepText").style.display = "none";
  document.getElementById("pageTitle").innerText = "";

  document.getElementById("successScreen").classList.add("active");
  document.querySelectorAll(".progress-step").forEach(function (bar) { bar.classList.add("active"); });
}

function finishSaleError(err) {
  showToast("שגיאה בשמירת הפרסום, נסי שוב");
  console.error("שגיאה:", err);
}
