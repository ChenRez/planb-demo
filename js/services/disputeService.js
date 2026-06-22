// ─────────────────────────────────────────────────────
//  disputeService.js  —  Disputes API calls
// ─────────────────────────────────────────────────────

function openDispute(disputeData, successCB, errorCB) {
    ajaxCall("POST", "/api/disputes", disputeData, successCB, errorCB);
}
