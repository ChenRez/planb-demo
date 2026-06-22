/* adminSmartQueuePage.js (admin/js) — SPM config API integration */

var _spmConfigs = {};  // param_name → param_value cache

function loadSPMConfigs() {
    ajaxCall(
        "GET", "/api/spm/configs", null,
        function (configs) {
            _spmConfigs = {};
            configs.forEach(function (cfg) {
                _spmConfigs[cfg.paramName] = cfg.paramValue;
            });

            // Populate inputs that carry a data-spm attribute
            $("[data-spm]").each(function () {
                var param = $(this).data("spm");
                if (_spmConfigs[param] !== undefined) {
                    $(this).val(_spmConfigs[param]);
                }
            });
        },
        function () { /* silent — inputs keep their HTML defaults */ }
    );
}

// Override the demo confirmSave from adminSmartQueuePage.js (wwwroot/js/pages)
function confirmSave() {
    closeModals();

    var adminId = parseInt(localStorage.getItem("userId")) || 1;
    var changed = false;

    $("[data-spm]").each(function () {
        var param    = $(this).data("spm");
        var newValue = String($(this).val());
        var oldValue = String(_spmConfigs[param] || "");

        if (newValue !== oldValue) {
            changed = true;
            ajaxCall(
                "PUT", "/api/spm/configs/" + encodeURIComponent(param) + "?adminId=" + adminId,
                { paramValue: newValue, adminId: adminId },
                function () { _spmConfigs[param] = newValue; },
                function () {}
            );
        }
    });

    showToast(changed ? "ההגדרות נשמרו בהצלחה." : "אין שינויים לשמירה.");
}

$(document).ready(function () {
    // ה"תור" ירד מהסקופ והפך לאלגוריתם ההתראות החכמות (SPM).
    // מסירים את מקטעי התור (תיעדוף/חלון רכישה/מקביליות) — נשאר רק קונפיג ה-SPM האמיתי (data-spm).
    $("#settingsContainer > div").each(function () {
        if (!$(this).find("[data-spm]").length) $(this).remove();
    });
    loadSPMConfigs();
});
