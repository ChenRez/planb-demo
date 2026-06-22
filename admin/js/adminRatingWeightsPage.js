/* adminRatingWeightsPage.js (admin/js) — weight sliders API integration */

// Mapping: slider id → SPMConfig param_name
var WEIGHT_MAP = {
    range1: "preference_weight",
    range2: "favorites_weight",
    range3: "trust_weight",
    range4: "response_weight",
    range5: "urgency_weight"
};

var _weightCache = {};  // param_name → current decimal value

function loadWeightConfigs() {
    ajaxCall(
        "GET", "/api/spm/configs", null,
        function (configs) {
            configs.forEach(function (cfg) {
                _weightCache[cfg.paramName] = parseFloat(cfg.paramValue);
            });

            // Populate sliders (decimal 0–1 → integer 0–100)
            Object.keys(WEIGHT_MAP).forEach(function (rangeId) {
                var param = WEIGHT_MAP[rangeId];
                if (_weightCache[param] !== undefined) {
                    var pct = Math.round(_weightCache[param] * 100);
                    var el  = document.getElementById(rangeId);
                    if (el) { el.value = pct; }
                }
            });

            // Trigger the existing inline updateWeights() to refresh badges + total
            if (typeof updateWeights === "function") updateWeights();
        },
        function () { /* silent — sliders keep their HTML defaults */ }
    );
}

// confirmSave — שמירת המשקלים שהשתנו ל-API (PUT לכל param)
function confirmSave() {
    closeModals();

    var adminId = parseInt(localStorage.getItem("userId")) || 1;
    var saves   = [];

    Object.keys(WEIGHT_MAP).forEach(function (rangeId) {
        var param   = WEIGHT_MAP[rangeId];
        var el      = document.getElementById(rangeId);
        if (!el) return;

        var pct       = parseInt(el.value);
        var decimal   = (pct / 100).toFixed(2);
        var oldVal    = (_weightCache[param] || 0).toFixed(2);

        if (decimal !== oldVal) {
            saves.push({ param: param, value: decimal });
        }
    });

    if (saves.length === 0) {
        showToast("אין שינויים לשמירה.");
        return;
    }

    var done = 0;
    saves.forEach(function (item) {
        ajaxCall(
            "PUT", "/api/spm/configs/" + encodeURIComponent(item.param) + "?adminId=" + adminId,
            { paramValue: item.value, adminId: adminId },
            function () {
                _weightCache[item.param] = parseFloat(item.value);
                done++;
                if (done === saves.length) showToast("המשקלים עודכנו בהצלחה.");
            },
            function () {
                done++;
                if (done === saves.length) showToast("חלק מהשמירות נכשלו.");
            }
        );
    });
}

$(document).ready(function () {
    loadWeightConfigs();
});
