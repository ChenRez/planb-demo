var currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  if (!requireAuth()) return;
  var userId = localStorage.getItem("userId");

  ajaxCall("GET", "/api/users/" + userId, null,
    function (user) {
      currentUser = user;
      document.getElementById("profileName").textContent     = user.firstName + " " + user.lastName;
      document.getElementById("profileFullName").textContent = user.firstName + " " + user.lastName;
      document.getElementById("profileEmail").textContent    = user.email;
      document.getElementById("profilePhone").textContent    = user.phone || "לא הוגדר";
      document.getElementById("profileCity").textContent     = user.city  || "לא הוגדר";
      var year = new Date(user.createdAt).getFullYear();
      document.getElementById("profileJoinDate").textContent = "חבר/ה ב-PlanB מאז " + year;
      updateRatingDisplay(user.scoreAsSeller, user.totalSales);
      if (user.avatarUrl) showAvatar(user.avatarUrl);
    },
    function () {
      window.location.href = "login.html";
    }
  );

  ajaxCall("GET", "/api/users/" + userId + "/payment", null,
    function (pm) {
      if (pm && pm.cardNumber) {
        document.getElementById("paymentVal").textContent = "•••• " + pm.cardNumber.slice(-4);
        document.getElementById("pmCardNumber").value    = pm.cardNumber    || "";
        document.getElementById("pmExpiryMonth").value  = pm.expiryMonth   || "";
        document.getElementById("pmExpiryYear").value   = pm.expiryYear    || "";
        document.getElementById("pmCvv").value          = pm.cvv           || "";
        document.getElementById("pmIdNumber").value     = pm.idNumber      || "";
      }
    },
    function () {}
  );

  ajaxCall("GET", "/api/users/" + userId + "/bank", null,
    function (bd) {
      if (bd && bd.bankName) {
        document.getElementById("bankVal").textContent       = bd.bankName;
        document.getElementById("bdBankName").value         = bd.bankName      || "";
        document.getElementById("bdBranchNumber").value     = bd.branchNumber  || "";
        document.getElementById("bdAccountNumber").value    = bd.accountNumber || "";
        document.getElementById("bdIdNumber").value         = bd.idNumber      || "";
      }
    },
    function () {}
  );

  $("#edPhone").on("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
  initEditCityAutocomplete();
});

function updateRatingDisplay(score, totalSales) {
  var ratingBox = document.getElementById("ratingBox");
  if (!totalSales || totalSales === 0) {
    ratingBox.innerHTML = "<p style='text-align:center;color:#909090;font-size:14px;font-weight:600;padding:10px 0'>אין דירוג עדיין</p>";
    return;
  }
  var stars      = Math.round((score / 20) * 10) / 10;
  var fullStars  = Math.floor(stars);
  var halfStar   = (stars - fullStars >= 0.5) ? 1 : 0;
  var emptyStars = 5 - fullStars - halfStar;
  var starsHtml  = "";
  for (var i = 0; i < fullStars;  i++) starsHtml += '<i class="fas fa-star"></i>';
  if (halfStar)                         starsHtml += '<i class="fas fa-star-half-alt"></i>';
  for (var j = 0; j < emptyStars; j++) starsHtml += '<i class="far fa-star"></i>';

  document.getElementById("ratingScore").textContent  = stars.toFixed(1);
  document.getElementById("ratingStars").innerHTML    = starsHtml;
  document.getElementById("ratingCount").textContent  = "מתוך " + totalSales + " מכירות מוצלחות";
}

function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function savePassword() {
  var userId      = localStorage.getItem("userId");
  var currentPass = document.getElementById("currentPassword").value;
  var newPass     = document.getElementById("newPassword").value;
  var confirmPass = document.getElementById("confirmPassword").value;
  var errEl       = document.getElementById("passwordError");

  errEl.style.display = "none";

  if (!currentPass || !newPass || !confirmPass) {
    errEl.textContent = "יש למלא את כל השדות";
    errEl.style.display = "block";
    return;
  }
  if (newPass !== confirmPass) {
    errEl.textContent = "הסיסמאות החדשות אינן תואמות";
    errEl.style.display = "block";
    return;
  }
  if (newPass.length < 6) {
    errEl.textContent = "הסיסמה החדשה חייבת להכיל לפחות 6 תווים";
    errEl.style.display = "block";
    return;
  }

  ajaxCall("PUT", "/api/users/" + userId + "/password?requesterId=" + userId,
    { currentPassword: currentPass, newPassword: newPass, confirmPassword: confirmPass },
    function () {
      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value     = "";
      document.getElementById("confirmPassword").value = "";
      closeModal("passwordModal");
    },
    function (xhr) {
      var msg = (xhr && xhr.responseJSON && xhr.responseJSON.message) || "שגיאה בשינוי הסיסמה";
      errEl.textContent    = msg;
      errEl.style.display  = "block";
    }
  );
}

function savePayment() {
  var userId  = localStorage.getItem("userId");
  var cardNum = document.getElementById("pmCardNumber").value;
  var dto = {
    cardNumber:  cardNum || null,
    expiryMonth: parseInt(document.getElementById("pmExpiryMonth").value) || null,
    expiryYear:  parseInt(document.getElementById("pmExpiryYear").value)  || null,
    cvv:         document.getElementById("pmCvv").value      || null,
    idNumber:    document.getElementById("pmIdNumber").value || null
  };
  ajaxCall("PUT", "/api/users/" + userId + "/payment",
    dto,
    function () {
      if (cardNum) document.getElementById("paymentVal").textContent = "•••• " + cardNum.slice(-4);
      closeModal("paymentModal");
    },
    function () { alert("שגיאה בשמירת פרטי תשלום"); }
  );
}

function saveBank() {
  var userId   = localStorage.getItem("userId");
  var bankName = document.getElementById("bdBankName").value;
  var dto = {
    bankName:      bankName || null,
    branchNumber:  document.getElementById("bdBranchNumber").value  || null,
    accountNumber: document.getElementById("bdAccountNumber").value || null,
    idNumber:      document.getElementById("bdIdNumber").value      || null
  };
  ajaxCall("PUT", "/api/users/" + userId + "/bank",
    dto,
    function () {
      if (bankName) document.getElementById("bankVal").textContent = bankName;
      closeModal("bankModal");
    },
    function () { alert("שגיאה בשמירת פרטי בנק"); }
  );
}

function openEditModal() {
  if (!currentUser) return;
  document.getElementById("edFirstName").value   = currentUser.firstName || "";
  document.getElementById("edLastName").value    = currentUser.lastName  || "";
  document.getElementById("edPhone").value       = currentUser.phone     || "";
  document.getElementById("edCity").value        = currentUser.city      || "";
  document.getElementById("edCityId").value      = currentUser.cityId    || "";
  document.getElementById("edDescription").value = currentUser.profileDescription || "";
  document.getElementById("editError").style.display = "none";
  openModal("editModal");
}

function showEditError(msg) {
  var errEl = document.getElementById("editError");
  errEl.textContent   = msg;
  errEl.style.display = "block";
}

function saveProfile() {
  var userId      = localStorage.getItem("userId");
  var firstName   = document.getElementById("edFirstName").value.trim();
  var lastName    = document.getElementById("edLastName").value.trim();
  var phone       = document.getElementById("edPhone").value.replace(/\D/g, "");
  var city        = document.getElementById("edCity").value.trim();
  var cityId      = document.getElementById("edCityId").value;
  var description = document.getElementById("edDescription").value.trim();

  document.getElementById("editError").style.display = "none";

  if (!firstName) return showEditError("יש להזין שם פרטי");
  if (!lastName)  return showEditError("יש להזין שם משפחה");
  if (!phone)     return showEditError("יש להזין מספר טלפון");
  if (!/^05\d{8}$/.test(phone)) return showEditError("מספר טלפון לא תקין (נייד ישראלי בן 10 ספרות)");
  if (city && !cityId) return showEditError("יש לבחור עיר מהרשימה");

  var dto = {
    firstName:          firstName,
    lastName:           lastName,
    phone:              phone,
    city:               city || null,
    cityId:             cityId ? parseInt(cityId, 10) : null,
    profileDescription: description || null
  };

  ajaxCall("PUT", "/api/users/" + userId + "?requesterId=" + userId, dto,
    function () {
      currentUser.firstName          = firstName;
      currentUser.lastName           = lastName;
      currentUser.phone              = phone;
      currentUser.city               = city;
      currentUser.cityId             = dto.cityId;
      currentUser.profileDescription = description;
      document.getElementById("profileName").textContent     = firstName + " " + lastName;
      document.getElementById("profileFullName").textContent = firstName + " " + lastName;
      document.getElementById("profilePhone").textContent    = phone || "לא הוגדר";
      document.getElementById("profileCity").textContent     = city  || "לא הוגדר";
      closeModal("editModal");
    },
    function (xhr) {
      showEditError((xhr && xhr.responseJSON && xhr.responseJSON.message) || "שגיאה בעדכון הפרטים");
    }
  );
}

function initEditCityAutocomplete() {
  var $city   = $("#edCity");
  var $cityId = $("#edCityId");
  var $list   = $("#edCitySuggestions");
  var timer   = null;

  $city.on("input", function () {
    $cityId.val("");
    var q = $city.val().trim();
    clearTimeout(timer);
    if (q.length < 2) { $list.hide().empty(); return; }
    timer = setTimeout(function () {
      searchCities(q, function (cities) {
        $list.empty();
        if (!cities || cities.length === 0) { $list.hide(); return; }
        cities.forEach(function (c) {
          var $li = $("<li>").attr("data-id", c.cityId).text(c.name);
          if (c.district) {
            $li.append($('<span class="city-district">').text(c.district));
          }
          $li.on("click", function () {
            $city.val(c.name);
            $cityId.val(c.cityId);
            $list.hide().empty();
          });
          $list.append($li);
        });
        $list.show();
      }, function () { $list.hide().empty(); });
    }, 200);
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#edCityGroup").length) $list.hide();
  });
}

function showAvatar(url) {
  var img = document.getElementById("avatarImg");
  img.src = mediaUrl(url);
  img.style.display = "block";
  document.getElementById("avatarIcon").style.display = "none";
  document.getElementById("avatarDeleteBadge").style.display = "flex";
}

function uploadAvatar(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  // Demo mode: show preview locally without server upload
  var reader = new FileReader();
  reader.onload = function(e) { showAvatar(e.target.result); };
  reader.readAsDataURL(file);
  input.value = "";
}

function deleteAvatar() {
  if (!confirm("למחוק את תמונת הפרופיל?")) return;
  var userId = localStorage.getItem("userId");
  ajaxCall("DELETE", "/api/users/" + userId + "/avatar?requesterId=" + userId, null,
    function () {
      var img = document.getElementById("avatarImg");
      img.style.display = "none";
      img.src = "";
      document.getElementById("avatarIcon").style.display = "block";
      document.getElementById("avatarDeleteBadge").style.display = "none";
    },
    function (xhr) {
      alert((xhr && xhr.responseJSON && xhr.responseJSON.message) || "שגיאה במחיקת התמונה");
    }
  );
}

function openEmailModal() {
  if (!currentUser) return;
  document.getElementById("emNewEmail").value = currentUser.email || "";
  document.getElementById("emailError").style.display = "none";
  openModal("emailModal");
}

function saveEmail() {
  var userId = localStorage.getItem("userId");
  var email  = document.getElementById("emNewEmail").value.trim();
  var errEl  = document.getElementById("emailError");
  errEl.style.display = "none";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errEl.textContent   = "כתובת אימייל לא תקינה";
    errEl.style.display = "block";
    return;
  }

  ajaxCall("PUT", "/api/users/" + userId + "/email?requesterId=" + userId, { email: email },
    function () {
      currentUser.email = email;
      document.getElementById("profileEmail").textContent = email;
      closeModal("emailModal");
    },
    function (xhr) {
      errEl.textContent   = (xhr && xhr.responseJSON && xhr.responseJSON.message) || "שגיאה בעדכון האימייל";
      errEl.style.display = "block";
    }
  );
}
