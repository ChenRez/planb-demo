/* adminDisputesPage.js — לוגיקת מסך ניהול מחלוקות */

const DISPUTE_TYPE_LABELS = {
    not_valid:       { text: "לא תקין",        cls: "type-not-valid"       },
    not_transferred: { text: "לא הועבר",        cls: "type-not-transferred" },
    payment_issue:   { text: "בעיה בתשלום",     cls: "type-payment-issue"   },
    other:           { text: "אחר",             cls: "type-other"           }
};

const DISPUTE_STATUS_LABELS = {
    Open:     { text: "פתוח",    cls: "status-open"     },
    InReview: { text: "בטיפול",  cls: "status-inreview" },
    Resolved: { text: "נפתר",   cls: "status-resolved"  },
    Closed:   { text: "סגור",   cls: "status-closed"    }
};

function formatDisputeDate(dateStr) {
    if (!dateStr) return "";
    const d   = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "אתמול";
    if (diffDays <  7)  return "לפני " + diffDays + " ימים";
    return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
}

function buildDisputeCard(dispute) {
    const typeInfo   = DISPUTE_TYPE_LABELS[dispute.disputeType]  || { text: dispute.disputeType, cls: "type-other" };
    const statusInfo = DISPUTE_STATUS_LABELS[dispute.status]     || { text: dispute.status,      cls: "status-closed" };
    const opener     = dispute.openerName || "משתמש #" + dispute.openerId;
    const dateStr    = formatDisputeDate(dispute.openedAt);
    const amount     = dispute.transactionAmount != null ? dispute.transactionAmount + "₪" : "";

    return $("<div>").addClass("admin-dispute-card").append(
        $("<div>").addClass("admin-ticket-header").append(
            $("<div>").addClass("admin-user-name").text(opener),
            $("<div>").addClass("admin-time").text(dateStr)
        ),
        $("<div>").addClass("admin-ticket-tags").append(
            $("<span>").addClass("admin-tag " + typeInfo.cls).text(typeInfo.text),
            $("<span>").addClass("admin-tag " + statusInfo.cls).text(statusInfo.text)
        ),
        $("<div>").addClass("admin-ticket-snippet").text(dispute.description || "—"),
        $("<div>").addClass("admin-ticket-meta").append(
            $("<span>").text("#" + dispute.disputeId),
            $("<span>").text(amount)
        )
    );
}

function renderDisputes(disputes) {
    const $list = $("#disputeList");
    $list.empty();

    if (!disputes || disputes.length === 0) {
        $list.html(
            "<div class='empty-state'>" +
            "<i class='fas fa-check-circle'></i>" +
            "<div>אין מחלוקות להצגה</div>" +
            "</div>"
        );
        return;
    }

    disputes.forEach(function (d) {
        $list.append(buildDisputeCard(d));
    });
}

function switchDisputeTab(el) {
    $(".admin-tab").removeClass("active");
    $(el).addClass("active");

    const status = $(el).data("status");
    loadDisputes(status);
}

function loadDisputes(status) {
    getDisputes(
        status,
        function (disputes) { renderDisputes(disputes); },
        function () {
            $("#disputeList").html(
                "<div class='empty-state'>" +
                "<i class='fas fa-exclamation-circle'></i>" +
                "<div>שגיאה בטעינת המחלוקות</div>" +
                "</div>"
            );
        }
    );
}

$(document).ready(function () {
    loadDisputes("Open");
});
