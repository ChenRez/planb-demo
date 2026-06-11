// ─────────────────────────────────────────────────────
//  transactionService.js  —  Transactions API calls
// ─────────────────────────────────────────────────────

function createTransaction(transaction, successCB, errorCB) {
    ajaxCall("POST", "/api/transactions", JSON.stringify(transaction), successCB, errorCB);
}

function getTransactionsByBuyer(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/transactions/by-buyer/" + userId, null, successCB, errorCB);
}
