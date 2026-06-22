/* toast.js — Global Toast Notification System
 * מערכת התראות גלובלית להחלפת alert()
 * שימוש: כלול את הקובץ ב-HTML, ואז קרא ל-showToast("הודעה")
 */

(function() {
  'use strict';

  // יצירת אלמנט ה-toast אם לא קיים
  function ensureToastElement() {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> <span id="toastMsg"></span>';
      document.body.appendChild(toast);
    }
    return toast;
  }

  // פונקציה גלובלית להצגת הודעה
  window.showToast = function(message, duration) {
    const toast = ensureToastElement();
    const msgSpan = document.getElementById('toastMsg');
    if (msgSpan) {
      msgSpan.textContent = message;
    } else {
      toast.textContent = message;
    }
    
    toast.classList.add('show');
    
    const hideAfter = duration || 3000;
    setTimeout(function() {
      toast.classList.remove('show');
    }, hideAfter);
  };

})();
