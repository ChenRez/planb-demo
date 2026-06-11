/* adminConversationPage.js — תיבת תמיכה */

function switchTab(el) {
  document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.remove("active"));
  el.classList.add("active");
}

function toggleChip(el) {
  if (el.innerText === "הכל") {
    document.querySelectorAll(".admin-chip").forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
  } else {
    const allChip = document.querySelector(".admin-chip:first-child");
    allChip.classList.remove("active");
    el.classList.toggle("active");
    if (!document.querySelector(".admin-chip.active")) allChip.classList.add("active");
  }
}
