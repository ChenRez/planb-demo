/* chatPage.js — לוגיקת מסך הצ'אט */

/* פתיחת שיחה קיימת */
function openChat(name, product) {
  document.getElementById("chatListScreen").classList.remove("active");
  document.getElementById("chatRoomScreen").classList.add("active");

  document.getElementById("activeName").innerText = name;
  document.getElementById("activeProduct").innerText = product;

  const container = document.getElementById("messagesContainer");
  container.innerHTML = `<div class="date-divider"><span>היום</span></div>
      <div class="msg-row received"><div class="msg-bubble">היי, זה בקשר ל${product}. רלוונטי? <span class="msg-time">10:42</span></div></div>`;
}

function closeChat() {
  document.getElementById("chatRoomScreen").classList.remove("active");
  document.getElementById("chatListScreen").classList.add("active");
}

/* ניהול שיחה חדשה */
function openNewChatModal() {
  document.getElementById("newChatModal").style.display = "flex";
}

function closeNewChatModal() {
  document.getElementById("newChatModal").style.display = "none";
}

function startNewChatFromSearch(name, product) {
  closeNewChatModal();
  openChat(name, product);

  const container = document.getElementById("messagesContainer");
  container.innerHTML = `<div class="date-divider"><span>התחלת שיחה חדשה</span></div>
  <div class="msg-row sent"><div class="msg-bubble" style="background:#f0f2f5; color:#666; text-align:center; font-size:12px; box-shadow:none;">התחלתם שיחה עם ${name} בקשר ל-${product}</div></div>`;
}

/* שליחת הודעה */
function sendMessage() {
  const input     = document.getElementById("msgInput");
  const text      = input.value.trim();
  const container = document.getElementById("messagesContainer");

  if (!text) return;

  // Immediate visual update
  const time   = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const msgDiv = document.createElement("div");
  msgDiv.className = "msg-row sent slide-in";
  msgDiv.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}<span class="msg-time">${time} <i class="fas fa-check"></i></span></div>`;
  container.appendChild(msgDiv);
  input.value = "";
  container.scrollTop = container.scrollHeight;

  // Persist via API when inside a real listing chat
  if (currentListingId) {
    sendChatMessage(
      currentListingId,
      {
        listingId:  currentListingId,
        senderId:   currentUserId,
        receiverId: currentReceiverId,
        content:    text
      },
      function () { /* success — message already shown */ },
      function () { /* silent: offline / error doesn't remove bubble */ }
    );
  }
}

function handleEnter(e) {
  if (e.key === "Enter") sendMessage();
}

// ── Chat API integration ──────────────────────────────────────

let currentListingId  = null;
let currentUserId     = 1;
let currentReceiverId = 0;

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function formatMsgTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function loadChatMessages(listingId) {
  getChatMessages(
    listingId,
    function (messages) {
      const container = document.getElementById("messagesContainer");
      container.innerHTML = '<div class="date-divider"><span>היום</span></div>';

      messages.forEach(function (msg) {
        const isSent = msg.senderId === currentUserId;
        const msgDiv = document.createElement("div");
        msgDiv.className = "msg-row " + (isSent ? "sent" : "received");
        msgDiv.innerHTML =
          `<div class="msg-bubble">${escapeHtml(msg.content)}` +
          `<span class="msg-time">${formatMsgTime(msg.sentAt)}` +
          (isSent ? ' <i class="fas fa-check"></i>' : "") +
          `</span></div>`;
        container.appendChild(msgDiv);

        // Derive receiver from the first message sent by someone else
        if (!currentReceiverId && !isSent) {
          currentReceiverId = msg.senderId;
        }
      });

      container.scrollTop = container.scrollHeight;
    },
    function () { /* silent — chat still usable offline */ }
  );
}

function formatConvTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "אתמול";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" });
}

function loadConversations(userId) {
  getConversations(
    userId,
    function (convs) {
      const list = document.getElementById("convList");
      if (!convs || convs.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#999;padding:40px 20px;font-size:14px;">אין שיחות עדיין</div>';
        return;
      }

      list.innerHTML = "";
      convs.forEach(function (conv) {
        const unreadHtml = conv.unreadCount > 0
          ? '<div class="unread-badge">' + conv.unreadCount + '</div>'
          : '<i class="fas fa-check-double read-icon"></i>';
        const itemClass = conv.unreadCount > 0 ? "conv-item unread" : "conv-item";
        const initials  = conv.otherUserName ? conv.otherUserName.split(" ").map(function(w){ return w[0]; }).join("").slice(0,2) : "?";
        const preview   = conv.lastMessage.length > 40 ? conv.lastMessage.slice(0, 40) + "..." : conv.lastMessage;

        const div = document.createElement("div");
        div.className = itemClass;
        div.innerHTML =
          '<div class="avatar-wrap">' +
            '<div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#ed5f65,#b34467);display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700;">' + initials + '</div>' +
          '</div>' +
          '<div class="conv-info">' +
            '<div class="conv-top">' +
              '<span class="conv-name">' + escapeHtml(conv.otherUserName) + '</span>' +
              '<span class="conv-time">' + formatConvTime(conv.lastSent) + '</span>' +
            '</div>' +
            '<div class="conv-bottom">' +
              '<span class="conv-preview">' + escapeHtml(preview) + '</span>' +
              unreadHtml +
            '</div>' +
            '<div class="product-tag"><i class="fas fa-ticket-alt"></i> ' + escapeHtml(conv.listingTitle) + '</div>' +
          '</div>';

        div.addEventListener("click", function () {
          currentReceiverId = conv.otherUserId;
          openChatRoom(conv.otherUserName, conv.listingTitle, conv.listingId, conv.otherUserId);
        });
        list.appendChild(div);
      });
    },
    function () {
      /* silent — list keeps showing any static fallback */
    }
  );
}

function openChatRoom(name, product, listingId, receiverId) {
  document.getElementById("chatListScreen").classList.remove("active");
  document.getElementById("chatRoomScreen").classList.add("active");
  document.getElementById("activeName").innerText   = name;
  document.getElementById("activeProduct").innerText = product;
  currentListingId  = listingId;
  currentReceiverId = receiverId;
  loadChatMessages(listingId);
}

$(document).ready(function () {
  if (!requireAuth()) return;
  currentUserId     = parseInt(localStorage.getItem("userId"));
  currentListingId  = parseInt(getUrlParam("listingId"))  || null;
  currentReceiverId = parseInt(getUrlParam("receiverId")) || 0;

  if (currentListingId) {
    document.getElementById("chatListScreen").classList.remove("active");
    document.getElementById("chatRoomScreen").classList.add("active");

    const name  = getUrlParam("sellerName") || "";
    const title = getUrlParam("title")      || "";
    if (name)  document.getElementById("activeName").innerText    = name;
    if (title) document.getElementById("activeProduct").innerText = title;

    loadChatMessages(currentListingId);
  } else {
    loadConversations(currentUserId);
  }
});
