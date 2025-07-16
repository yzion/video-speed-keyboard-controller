// background.js
// Handles storage, settings, and communication between content/options

let currentIcon = 'base'; // Track current icon state

// Initialize with base icon on startup
chrome.action.setIcon({
  path: "base_icon_48.png"
}, () => {
  if (chrome.runtime.lastError) {
    console.error('Background: Failed to set initial icon:', chrome.runtime.lastError);
  } else {
    console.log('Background: Initial icon set to base_icon_48.png');
  }
});

chrome.action.setTitle({title: 'Video Controller (1.00×)'});

function updateIcon(speed) {
  console.log('Background: updateIcon called with speed:', speed);
  let newIcon, title;
  
  if (speed < 1.0) {
    newIcon = 'snail';
    title = `Slow Video Controller (${speed.toFixed(2)}×)`;
  } else if (speed > 1.0) {
    newIcon = 'rabbit';
    title = `Fast Video Controller (${speed.toFixed(2)}×)`;
  } else {
    newIcon = 'base';
    title = `Video Controller (${speed.toFixed(2)}×)`;
  }
  
  console.log('Background: switching to icon:', newIcon, 'current:', currentIcon);
  
  // Only update if icon changed to avoid unnecessary operations
  if (newIcon !== currentIcon) {
    currentIcon = newIcon;
    
    console.log('Background: actually updating icon to:', `${newIcon}_icon_48.png`);
    
    // Try using the properly sized icon
    chrome.action.setIcon({
      path: `${newIcon}_icon_48.png`
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Background: Icon update error:', chrome.runtime.lastError);
      } else {
        console.log('Background: Icon updated successfully to:', newIcon);
      }
    });
  }
  
  // Always update title to show current speed
  chrome.action.setTitle({title});
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background: Received message:', message.type, message);
  
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
  if (message.type === 'speedChanged') {
    console.log('Background: received speedChanged message:', message);
    updateIcon(message.speed);
    sendResponse({success: true});
    return true;
  }
});
