// ─────────────────────────────────────────────────────
//  disputeService.js  —  Disputes API calls
// ─────────────────────────────────────────────────────

function openDispute(disputeData, successCB, errorCB) {
    ajaxCall("POST", "/api/disputes", JSON.stringify(disputeData), successCB, errorCB);
}
