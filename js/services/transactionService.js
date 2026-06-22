// ─────────────────────────────────────────────────────
//  transactionService.js  —  Transactions API calls
// ─────────────────────────────────────────────────────

function createTransaction(transaction, userId, successCB, errorCB) {
    ajaxCall("POST", "/api/transactions?userId=" + userId, transaction, successCB, errorCB);
}

function getTransactionsByBuyer(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/transactions/by-buyer/" + userId, null, successCB, errorCB);
}
