// background.js
// Handles storage, settings, and communication between content/options

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse(settings);
    });
    return true;
  }
  if (message.type === 'setSettings') {
    chrome.storage.sync.set(message.settings, () => {
      sendResponse({success: true});
    });
    return true;
  }
});
