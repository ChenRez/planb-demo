/* adminSmartQueuePage.js — הגדרות תור חכם (SPM) */

function toggleSettings() {
  const toggle    = document.getElementById("mainToggle");
  const container = document.getElementById("settingsContainer");
  container.classList.toggle("disabled", !toggle.checked);
}

function toggleMixSlider() {
  const radios = document.getElementsByName("priority");
  const box    = document.getElementById("mixSliderBox");
  let isMix    = Array.from(radios).some((r) => r.checked && r.value === "mix");
  box.style.display = isMix ? "block" : "none";
}

function updateMixLabel(val) {
  document.getElementById("mixLabel").innerText = `${val}% חיפוש | ${100 - val}% העדפות`;
}

function openSaveModal()  { document.getElementById("saveModal").style.display = "flex"; }
function closeModals()    { document.getElementById("saveModal").style.display = "none"; }

function toggleOtherInput() {
  const select = document.getElementById("changeReason");
  const input  = document.getElementById("otherInput");
  input.style.display = select.value === "other" ? "block" : "none";
}

function confirmSave() { closeModals(); showToast("ההגדרות נשמרו בהצלחה."); }

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg; toast.classList.add("show");
  setTimeout(() => { toast.classList.remove("show"); }, 3000);
}
