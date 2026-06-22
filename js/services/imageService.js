// ─────────────────────────────────────────────────────
//  imageService.js  —  Smart Image suggestion API call
// ─────────────────────────────────────────────────────

function suggestImage(payload, successCB, errorCB) {
  ajaxCall("POST", "/api/listings/suggest-image", payload, successCB, errorCB);
}
