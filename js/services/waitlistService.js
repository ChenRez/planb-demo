// ─────────────────────────────────────────────────────
//  waitlistService.js  —  Waitlist API calls
// ─────────────────────────────────────────────────────

function getWaitlist(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/waitlist/" + userId, null, successCB, errorCB);
}

function addToWaitlist(entry, successCB, errorCB) {
    ajaxCall("POST", "/api/waitlist", JSON.stringify(entry), successCB, errorCB);
}
