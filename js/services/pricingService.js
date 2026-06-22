// ─────────────────────────────────────────────────────
//  pricingService.js  —  Smart Pricing API call
// ─────────────────────────────────────────────────────

function suggestPrice(payload, successCB, errorCB) {
  ajaxCall("POST", "/api/listings/suggest-price", payload, successCB, errorCB);
}
