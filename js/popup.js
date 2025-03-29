// popup.js
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['enabled'], (data) => {
    document.getElementById('toggle').checked = data.enabled !== false; // Default to checked
  });

  document.getElementById('toggle').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked }, () => {
      console.log("Toggle set to:", e.target.checked);
    });
  });
});