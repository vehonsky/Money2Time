// popup.js
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['enabled'], (data) => {
    document.getElementById('toggle').checked = data.enabled !== false; // Default to checked
  });

  document.getElementById('toggle').addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ enabled: isEnabled }, () => {
      // Reload the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});