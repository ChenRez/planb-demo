// ─────────────────────────────────────────────────────
//  citiesService.js  —  Cities autocomplete API calls
// ─────────────────────────────────────────────────────

function searchCities(query, successCB, errorCB) {
    ajaxCall("GET", "/api/cities?q=" + encodeURIComponent(query), null, successCB, errorCB);
}
