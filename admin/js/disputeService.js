// ─────────────────────────────────────────────────────
//  disputeService.js  —  Disputes + Admin API calls
//  Depends on ajaxCall from ../js/services/apiService.js
// ─────────────────────────────────────────────────────

function getDisputes(status, successCB, errorCB) {
    const url = status ? "/api/disputes?status=" + encodeURIComponent(status) : "/api/disputes";
    ajaxCall("GET", url, null, successCB, errorCB);
}

function getDashboardStats(successCB, errorCB) {
    ajaxCall("GET", "/api/admin/dashboard/stats?adminId=" + localStorage.getItem("userId"), null, successCB, errorCB);
}
