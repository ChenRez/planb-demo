// ─────────────────────────────────────────────────────
//  notificationService.js  —  Notifications API calls
// ─────────────────────────────────────────────────────

function getNotifications(userId, successCB, errorCB) {
    ajaxCall("GET", "/api/notifications/" + userId, null, successCB, errorCB);
}

function markAsRead(notificationId, successCB, errorCB) {
    ajaxCall("PUT", "/api/notifications/" + notificationId + "/read", null, successCB, errorCB);
}

// ─────────────────────────────────────────────────────
//  Bell badge — מציג עיגול אדום רק כשיש התראה חדשה
//  ונעלם כאשר נכנסים למסך ההתראות (lastSeen נשמר ב-localStorage)
// ─────────────────────────────────────────────────────

function notifLastSeenKey() {
    return "notifLastSeen_" + (localStorage.getItem("userId") || "0");
}

function setNotificationBadge(count) {
    var btns = document.querySelectorAll(".notification-btn");
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        var dot = btn.querySelector(".notif-badge");
        if (count > 0) {
            if (!dot) {
                dot = document.createElement("span");
                dot.className = "notif-badge";
                btn.appendChild(dot);
            }
            dot.textContent = count > 9 ? "9+" : String(count);
            dot.style.display = "flex";
        } else if (dot) {
            dot.style.display = "none";
        }
    }
}

function refreshNotificationBadge() {
    var userId = localStorage.getItem("userId");
    if (!userId) { setNotificationBadge(0); return; }
    getNotifications(userId, function (list) {
        if (!Array.isArray(list)) { setNotificationBadge(0); return; }
        var lastSeen = parseInt(localStorage.getItem(notifLastSeenKey()) || "0", 10);
        var count = 0;
        for (var i = 0; i < list.length; i++) {
            var n = list[i];
            if (n.isRead) continue;
            if (!lastSeen) { count++; continue; }
            var t = new Date(n.sentAt).getTime();
            if (isNaN(t) || t > lastSeen) count++;
        }
        setNotificationBadge(count);
    }, function () { setNotificationBadge(0); });
}

function markNotificationsSeen() {
    var userId = localStorage.getItem("userId");
    if (userId) localStorage.setItem(notifLastSeenKey(), String(Date.now()));
}

// חשיפה גלובלית (עבור appHeader שמזריק את הפעמון דינמית)
window.refreshNotificationBadge = refreshNotificationBadge;
window.markNotificationsSeen = markNotificationsSeen;

// init אוטומטי: בכל דף שמציג פעמון — לרענן את החיווי
(function () {
    function initBadge() {
        if (document.querySelector(".notification-btn")) {
            refreshNotificationBadge();
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initBadge);
    } else {
        initBadge();
    }
})();
