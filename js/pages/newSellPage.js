/* newSellPage.js — לוגיקת מסך יצירת מכירה חדשה (4 שלבים) */

let currentStep = 1;
let selectedCategory = "";
let selectedCategoryId = null;
let globalImageUrl = "";
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
});

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
  if (input.files && input.files[0]) {
    const fileName = input.files[0].name;
    const box = document.getElementById("ticketUploadBox");
    const icon = document.getElementById("ticketIcon");
    const text = document.getElementById("ticketText");

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
  }
}

function findAIImage() {
  const btn = document.getElementById("aiBtn");
  btn.innerHTML = `<div class="spinner-small"></div> מחפש תמונה...`;
  btn.disabled = true;

  setTimeout(() => {
    const simulatedImgUrl =
      "https://d3svuw7u2wrei6.cloudfront.net/2207/wp-content/uploads/2023/09/12210008/0402-SA23-700x1307-clean11-e1694530880716.jpg";
    globalImageUrl = simulatedImgUrl;

    const mainBox = document.getElementById("mainImageArea");
    mainBox.innerHTML = `<img src="${simulatedImgUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`;
    mainBox.style.padding = "0";
    mainBox.style.border = "none";
    mainBox.style.overflow = "hidden";

    btn.innerHTML = `<i class="fas fa-check"></i> התמונה נוספה בהצלחה!`;
    btn.style.backgroundColor = "#d1fae5";
    btn.style.color = "#065f46";
    btn.style.borderColor = "transparent";

    updatePreview();
  }, 2000);
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

    // Demo mode: skip server upload, use local preview data URL
    globalImageUrl = _previewDataUrl;
  }
}

function updatePreview() {
  const title    = document.getElementById("titleInput").value    || "כותרת המודעה שלך...";
  const location = document.getElementById("locationInput").value || "מיקום";
  const dateRaw  = document.getElementById("dateInput").value;
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
      generateSeatsInputs();
      break;
    case "תיירות":
      document.getElementById("SEC_TOURISM").style.display = "block";
      break;
    case "אטרקציות":
      document.getElementById("SEC_ATTRACTIONS").style.display = "block";
      break;
    case "שוברים":
      document.getElementById("SEC_VOUCHERS").style.display = "block";
      break;
    case "פסטיבלים":
      document.getElementById("SEC_FESTIVALS").style.display = "block";
      break;
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

  const qty   = document.getElementById("qtyInput").value  || "X";
  const title = document.getElementById("titleInput").value || "האירוע שלך";

  setTimeout(() => { loaderText.innerText = "מנתחים ביקוש ומצב שוק..."; }, 1500);

  setTimeout(() => {
    loader.style.display = "none";
    recommendation.style.display = "block";

    textContent.innerHTML = `
      עבור <strong>${qty}</strong> כרטיסים ל<strong>${title}</strong> היא:
      <br>
      <span style="font-size:24px; color:#2d3436; font-weight:800; line-height: 1.5;">400 ₪</span>
      <span style="font-size:14px; font-weight:600;">(200 ₪ לכרטיס)</span>
      <br>
      <span style="display:block; margin-top:12px; font-size:12px; color:#999; font-weight:400; border-top:1px solid #eee; padding-top:8px;">
        מבוסס על מחירים של פריטים דומים, זמינות, ביקוש וזמן עד למימוש
      </span>
    `;

    btn.innerHTML = `<i class="fas fa-check"></i> התמחור בוצע`;
    btn.style.backgroundColor = "#fff0f1";
    btn.style.color = "#ff4757";
    btn.style.opacity = "1";
  }, 3000);
}

function applyAIPrice() {
  document.getElementById("priceInput").value = 400;
  updatePreview();
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
  var ta = document.querySelector("#step2 textarea");
  return ta && ta.value.trim() ? ta.value.trim() : null;
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
  var title = document.getElementById("titleInput").value.trim() || "פרסום דמו";
  var price = parseFloat(document.getElementById("priceInput").value) || 0;
  var date  = document.getElementById("dateInput").value;

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
    notes:          _collectNotes(),
    homeGroup:      null,
    awayGroup:      null,
    sectorSeat:     null
  };

  _collectSectionFields(listing);

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
  alert("שגיאה בשמירת הפרסום, נסי שוב");
  console.error("שגיאה:", err);
}
