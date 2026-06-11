/* signupPage.js — לוגיקת דף ההרשמה */

function showWelcomeToast(firstName) {
  var toast = $('<div>').css({
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: 'linear-gradient(to right, #ed5f65 0%, #c53e5c 70%, #b34467 100%)',
    color: '#fff',
    borderRadius: '20px',
    padding: '12px 20px',
    boxShadow: '0 12px 40px rgba(197,62,92,0.35)',
    zIndex: 9999,
    maxWidth: '340px',
    width: '88%',
    textAlign: 'center',
    fontFamily: 'inherit',
    fontSize: '14px',
    lineHeight: '1.7',
    direction: 'rtl',
    opacity: 0,
    transition: 'opacity 0.4s ease, transform 0.4s ease'
  }).html(
    '<div style="font-size:32px;margin-bottom:10px">🎉</div>' +
    '<div style="font-size:16px;font-weight:700;margin-bottom:6px">ברוך/ה הבא/ה, ' + firstName + '!</div>' +
    '<div style="font-size:13px;opacity:0.92">כדי שנוכל להציג לך דברים בול בשבילך ' +
    'כדאי למלא בהמשך את ההעדפות שלך באזור האישי. ' +
    'פחות משתי דקות 😉</div>'
  );

  $('body').append(toast);
  setTimeout(function () {
    toast.css({ opacity: 1, transform: 'translateX(-50%) translateY(0)' });
  }, 30);

  setTimeout(function () {
    toast.css({ opacity: 0, transform: 'translateX(-50%) translateY(20px)' });
    setTimeout(function () {
      toast.remove();
      window.location.href = 'home.html';
    }, 400);
  }, 3800);
}

$(document).ready(function () {
  $("#signupForm").on("submit", handleSignup);

  $(".toggle-password").on("click", function () {
    var $btn   = $(this);
    var $input = $btn.closest(".input-group").find("input");
    var isHidden = $input.attr("type") === "password";
    $input.attr("type", isHidden ? "text" : "password");
    $btn.find("i").toggleClass("fa-eye fa-eye-slash");
  });

  $("#phone").on("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  initCityAutocomplete();
});

function setError($input, msg) {
  $input.addClass("input-error");
  var $group  = $input.closest(".input-group");
  var $anchor = $group.parent().hasClass("row") ? $group.parent() : $group;
  var id      = "err-" + $input.attr("id");
  var $err    = $("#" + id);
  if ($err.length === 0) {
    $err = $('<div class="field-error" id="' + id + '"></div>');
    $anchor.after($err);
  }
  $err.text(msg);
}

function clearErrors() {
  $(".glass-input").removeClass("input-error");
  $(".field-error").remove();
}

function collectSignupData() {
  return {
    firstName: $("#firstName").val().trim(),
    lastName:  $("#lastName").val().trim(),
    email:     $("#email").val().trim(),
    phone:     $("#phone").val().replace(/\D/g, ""),
    city:      $("#city").val().trim(),
    cityId:    $("#cityId").val(),
    password:  $("#password").val(),
    confirm:   $("#confirmPassword").val()
  };
}

function validateSignup(d) {
  clearErrors();
  var valid = true;

  if (!d.firstName) { setError($("#firstName"), "יש להזין שם פרטי"); valid = false; }
  if (!d.lastName)  { setError($("#lastName"),  "יש להזין שם משפחה"); valid = false; }
  if (!d.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) {
    setError($("#email"), "כתובת אימייל לא תקינה"); valid = false;
  }
  if (!d.phone) {
    setError($("#phone"), "יש להזין מספר טלפון"); valid = false;
  } else if (!/^05\d{8}$/.test(d.phone)) {
    setError($("#phone"), "מספר טלפון לא תקין (נייד ישראלי בן 10 ספרות)"); valid = false;
  }
  if (d.city && !d.cityId) {
    setError($("#city"), "יש לבחור עיר מהרשימה"); valid = false;
  }
  if (!d.password || d.password.length < 6) {
    setError($("#password"), "הסיסמה חייבת להכיל לפחות 6 תווים"); valid = false;
  }
  if (d.password !== d.confirm) {
    setError($("#confirmPassword"), "הסיסמאות אינן תואמות"); valid = false;
  }

  return valid;
}

function buildPayload(d) {
  return {
    firstName: d.firstName,
    lastName:  d.lastName,
    email:     d.email,
    phone:     d.phone,
    city:      d.city   || null,
    cityId:    d.cityId ? parseInt(d.cityId, 10) : null,
    password:  d.password
  };
}

function initCityAutocomplete() {
  var $city   = $("#city");
  var $cityId = $("#cityId");
  var $list   = $("#citySuggestions");
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
    if (!$(e.target).closest("#cityGroup").length) $list.hide();
  });
}

function goToPreferences() {
  var d = collectSignupData();
  if (!validateSignup(d)) return;

  sessionStorage.setItem("pendingSignup", JSON.stringify(buildPayload(d)));
  window.location.href = "userPreferences.html?fromSignup=1";
}

function handleSignup(event) {
  event.preventDefault();

  var d = collectSignupData();
  if (!validateSignup(d)) return;

  var data = buildPayload(d);

  $(".submit-btn").prop("disabled", true).text("שולח...");

  ajaxCall("POST", "/api/auth/register", data,
    function (res) {
      localStorage.setItem("userId",    res.userId);
      localStorage.setItem("firstName", data.firstName);
      showWelcomeToast(data.firstName);
    },
    function (err) {
      $(".submit-btn").prop("disabled", false).text("יצירת חשבון");
      if (err.status === 409) {
        var msg409 = (err.responseJSON && err.responseJSON.message) || "הפרטים כבר קיימים במערכת";
        setError(msg409.indexOf("טלפון") !== -1 ? $("#phone") : $("#email"), msg409);
      } else if (err.status === 400) {
        alert((err.responseJSON && err.responseJSON.message) || "נתונים חסרים או שגויים");
      } else {
        alert("שגיאה בהרשמה, נסי שוב");
      }
    }
  );
}
