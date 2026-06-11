// ─────────────────────────────────────────────────────
//  chatService.js  —  Chat API calls
// ─────────────────────────────────────────────────────

function getConversations(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/chat/user/" + userId + "/conversations", null, successCB, errorCB);
}

function getChatMessages(listingId, successCB, errorCB) {
    ajaxCall("GET", "/api/chat/" + listingId, null, successCB, errorCB);
}

function sendChatMessage(listingId, message, successCB, errorCB) {
    ajaxCall("POST", "/api/chat/" + listingId, JSON.stringify(message), successCB, errorCB);
}
