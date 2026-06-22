/* adminDashboardPage.js — לוגיקת לוח הבקרה */

$(document).ready(function () {
    getDashboardStats(
        function (stats) {
            if (stats.open_disputes      != null) $("[data-kpi='open_disputes']").text(stats.open_disputes);
            if (stats.suspended_listings != null) $("[data-kpi='suspended_listings']").text(stats.suspended_listings);
            if (stats.active_listings    != null) $("[data-kpi='active_listings']").text(stats.active_listings);
            if (stats.active_users       != null) $("[data-kpi='active_users']").text(stats.active_users);
            if (stats.active_categories  != null) $("[data-kpi='active_categories']").text(stats.active_categories);
        },
        function () { /* silent — static fallback values remain visible */ }
    );
});
