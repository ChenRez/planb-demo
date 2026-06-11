/* notificationsPage.js — לוגיקת מסך ההתראות */

// ── Rate modal (keep existing UI behaviour) ───────────────────

function openRateModal() {
    document.getElementById("rateModal").style.display = "flex";
}

function closeRateModal() {
    document.getElementById("rateModal").style.display = "none";
}

function toggleNA(el) {
    const starsContainer = el.parentElement.nextElementSibling;
    if (el.classList.contains("active-na")) {
        el.classList.remove("active-na");
        el.style.color = "#909090";
        el.style.fontWeight = "normal";
        starsContainer.style.opacity = "1";
        starsContainer.style.pointerEvents = "auto";
    } else {
        el.classList.add("active-na");
        el.style.color = "#ff4757";
        el.style.fontWeight = "bold";
        starsContainer.style.opacity = "0.3";
        starsContainer.style.pointerEvents = "none";
    }
}

function submitRating() {
    const btn = document.querySelector(".btn-submit-rate");
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fas fa-check"></i> נשלח!';
    btn.style.background = "#10b981";
    setTimeout(() => {
        closeRateModal();
        btn.innerText = originalText;
        btn.style.background = "";
    }, 1000);
}

// ── Helpers ───────────────────────────────────────────────────

function formatTime(dateStr) {
    const sent = new Date(dateStr);
    const now  = new Date();
    const diffMs  = now - sent;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH   = Math.floor(diffMin / 60);
    const diffD   = Math.floor(diffH / 24);

    if (diffMin < 1)  return "עכשיו";
    if (diffMin < 60) return "לפני " + diffMin + " דקות";
    if (diffH   < 24) return "לפני " + diffH   + " שעות";
    if (diffD   === 1) return "אתמול";
    return "לפני " + diffD + " ימים";
}

function buildNotifItem(notif) {
    const isUnread = !notif.isRead;

    const $item = $("<div>").addClass("notif-item").attr("data-id", notif.notificationId);
    if (isUnread) {
        $item.addClass("unread");
        $item.append($("<div>").addClass("unread-dot"));
    }

    const iconMap = {
        match:          { cls: "icon-alert",   icon: '<span class="material-symbols-rounded">pan_tool</span>' },
        match_found:    { cls: "icon-alert",   icon: '<span class="material-symbols-rounded">pan_tool</span>' },
        price_drop:     { cls: "icon-tip",      icon: '<i class="fas fa-tags"></i>' },
        status_change:  { cls: "icon-success",  icon: '<i class="fas fa-check"></i>' },
        dispute_update: { cls: "icon-msg",      icon: '<i class="fas fa-comment-dots"></i>' },
        sale_completed: { cls: "icon-success",  icon: '<i class="fas fa-check"></i>' },
        system:         { cls: "icon-view",     icon: '<i class="far fa-eye"></i>' }
    };
    const iconInfo = iconMap[notif.type] || { cls: "icon-view", icon: '<i class="far fa-eye"></i>' };

    $item.append(
        $("<div>").addClass("notif-icon-circle " + iconInfo.cls).html(iconInfo.icon)
    );

    const $content = $("<div>").addClass("notif-content");
    $content.append($("<div>").addClass("notif-text").text(notif.message));
    $content.append($("<span>").addClass("notif-time").text(formatTime(notif.sentAt)));
    $item.append($content);

    $item.on("click", function () {
        const id = $(this).data("id");
        if ($(this).hasClass("unread")) {
            markAsRead(
                id,
                function () {
                    $item.removeClass("unread");
                    $item.find(".unread-dot").remove();
                },
                function () { /* silent — UI already looks read */ }
            );
        }
    });

    const $deleteBtn = $('<button class="notif-delete-btn" title="מחק התראה">&#x2715;</button>');
    $deleteBtn.on("click", function (e) {
        e.stopPropagation();
        const id = $item.data("id");
        ajaxCall("DELETE", "/api/notifications/" + id, null,
            function () { $item.fadeOut(300, function () { $(this).remove(); }); },
            function () { alert("שגיאה במחיקת ההתראה"); }
        );
    });
    $item.append($deleteBtn);

    return $item;
}

// ── Load notifications on page ready ─────────────────────────

$(document).ready(function () {
    if (!requireAuth()) return;
    const userId = localStorage.getItem("userId");

    getNotifications(
        userId,
        function (notifications) {
            const $list = $(".notif-list");
            $list.empty();

            if (!notifications || notifications.length === 0) {
                $list.append(
                    $("<div>").addClass("notif-item").append(
                        $("<div>").addClass("notif-content").append(
                            $("<div>").addClass("notif-text").text("אין התראות להצגה")
                        )
                    )
                );
                return;
            }

            notifications.forEach(function (notif) {
                $list.append(buildNotifItem(notif));
            });
        },
        function () {
            $(".notif-list").html(
                "<div class='notif-item'><div class='notif-content'>" +
                "<div class='notif-text'>שגיאה בטעינת ההתראות. נסה שוב מאוחר יותר.</div>" +
                "</div></div>"
            );
        }
    );
});
