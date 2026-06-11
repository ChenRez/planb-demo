// ─────────────────────────────────────────────────────
//  notificationService.js  —  Notifications API calls
// ─────────────────────────────────────────────────────

function getNotifications(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/notifications/" + userId, null, successCB, errorCB);
}

function markAsRead(notificationId, successCB, errorCB) {
    ajaxCall("PUT", "/api/notifications/" + notificationId + "/read", null, successCB, errorCB);
}
