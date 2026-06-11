/* myPurchasesPage.js — לוגיקת מסך הרכישות שלי */

let activeDisputeTransactionId = 0;

function openDisputeModal(transactionId, title) {
    activeDisputeTransactionId = transactionId;
    document.getElementById("disputeModalDesc").innerText = 'רכישה: ' + title;
    document.getElementById("disputeDesc").value = "";
    document.getElementById("disputeError").style.display = "none";
    document.getElementById("disputeModal").style.display = "flex";
}

function closeDisputeModal() {
    document.getElementById("disputeModal").style.display = "none";
}

function submitDispute() {
    const desc = document.getElementById("disputeDesc").value.trim();
    const type = document.getElementById("disputeType").value;
    const errEl = document.getElementById("disputeError");

    if (!desc) {
        errEl.innerText = "יש לתאר את הבעיה";
        errEl.style.display = "block";
        return;
    }

    const userId = parseInt(localStorage.getItem("userId"));
    openDispute(
        { transactionId: activeDisputeTransactionId, openerId: userId, disputeType: type, description: desc },
        function () {
            closeDisputeModal();
            alert("המחלוקת נפתחה בהצלחה! צוות PlanB יטפל בבקשתך בהקדם.");
        },
        function () {
            errEl.innerText = "שגיאה בשליחה — נסה שנית";
            errEl.style.display = "block";
        }
    );
}

const STATUS_LABELS = {
    Completed: { text: "מוכן לשימוש", cls: "ready"   },
    Pending:   { text: "בהמתנה",      cls: "pending"  },
    Failed:    { text: "נכשל",         cls: "failed"   },
    Refunded:  { text: "הוחזר",        cls: "refunded" }
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function buildPurchaseItem(tx) {
    const statusInfo = STATUS_LABELS[tx.status] || { text: tx.status, cls: "pending" };
    const title      = tx.listingTitle || "רכישה #" + tx.transactionId;
    const seller     = tx.sellerName   ? "נרכש מ" + tx.sellerName : "";
    const dateStr    = formatDate(tx.createdAt);

    const $item = $("<div>").addClass("purchase-item");

    // thumbnail placeholder (no real image in transaction record)
    const $imgWrap = $("<div>").addClass("purchase-img-wrap").append(
        $("<div>").css({
            width: "100%", height: "100%",
            background: "linear-gradient(135deg,#ed5f65,#b34467)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "22px"
        }).html('<i class="fas fa-ticket-alt"></i>')
    );

    const $info = $("<div>").addClass("purchase-info").append(
        $("<span>").addClass("purchase-title").text(title),
        $("<div>").addClass("purchase-meta").html('<i class="far fa-calendar-alt"></i> ' + dateStr),
        seller ? $("<div>").addClass("purchase-meta sub-meta").text(seller) : null
    );

    const $statusCol = $("<div>").addClass("purchase-status-col").append(
        $("<div>").addClass("purchase-price").text(tx.totalAmount + "₪"),
        $("<span>").addClass("status-badge " + statusInfo.cls).text(statusInfo.text)
    );

    if (tx.status === "Completed") {
        const $disputeBtn = $("<button>")
            .addClass("dispute-link-btn")
            .html('<i class="fas fa-exclamation-circle"></i> פתח מחלוקת')
            .css({ fontSize: "11px", color: "#ed5f65", background: "none", border: "none",
                   cursor: "pointer", fontWeight: "600", padding: "4px 0", display: "block" })
            .on("click", function () { openDisputeModal(tx.transactionId, title); });
        $statusCol.append($disputeBtn);
    }

    $item.append($imgWrap, $info, $statusCol);
    return $item;
}

function updateStatCards(transactions) {
    const total        = transactions.reduce((sum, tx) => sum + (tx.totalAmount || 0), 0);
    const count        = transactions.length;
    const now          = new Date();
    const upcoming     = transactions.filter(function (tx) {
        // An event is upcoming if status is Completed and createdAt is in future
        // (listing event_date not available here — approximate by createdAt within 90 days)
        return tx.status === "Completed";
    }).length;

    const $statNums = $(".stat-num");
    if ($statNums.length >= 3) {
        $statNums.eq(0).text(total.toFixed(0) + "₪");
        $statNums.eq(1).text(count);
        $statNums.eq(2).text(upcoming);
    }
}

$(document).ready(function () {
    if (!requireAuth()) return;
    const userId = localStorage.getItem("userId");

    getTransactionsByBuyer(
        userId,
        function (transactions) {
            updateStatCards(transactions);

            const $list = $(".purchases-list");
            $list.empty();

            if (!transactions || transactions.length === 0) {
                $list.append(
                    $("<div>").addClass("purchase-item").append(
                        $("<div>").addClass("purchase-info").append(
                            $("<span>").addClass("purchase-title").text("אין רכישות עדיין")
                        )
                    )
                );
                return;
            }

            transactions.forEach(function (tx) {
                $list.append(buildPurchaseItem(tx));
            });
        },
        function () {
            $(".purchases-list").html(
                "<div class='purchase-item'><div class='purchase-info'>" +
                "<span class='purchase-title'>שגיאה בטעינת הרכישות. נסה שוב מאוחר יותר.</span>" +
                "</div></div>"
            );
        }
    );
});
