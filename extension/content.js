// content.js
// Injects video speed controls, overlays, and keyboard listeners

const DEFAULT_SETTINGS = {
  decreaseKey: '[',
  increaseKey: ']',
  resetKey: 'r',
  increment: 5,
  rememberPerSite: false,
  defaultSpeed: 1.0
};

let settings = {...DEFAULT_SETTINGS};

function fetchSettings() {
  chrome.runtime.sendMessage({type: 'getSettings'}, (stored) => {
    settings = {...DEFAULT_SETTINGS, ...stored};
  });
}

fetchSettings();

// Helper: get all videos
function getVideos() {
  return Array.from(document.querySelectorAll('video'));
}

// Helper: get focused/playing video
function getActiveVideo() {
  const videos = getVideos();
  // Prefer focused, then playing, then first
  return (
    videos.find(v => document.activeElement === v) ||
    videos.find(v => !v.paused) ||
    videos[0]
  );
}

// Overlay badge
function createSpeedBadge(video) {
  let badge = video._speedBadge;
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'fspeed-badge';
    badge.style.cssText = `
      position: absolute; z-index: 9999; left: 8px; top: 8px;
      background: rgba(0,0,0,0.6); color: #fff; font-size: 14px;
      padding: 2px 8px; border-radius: 4px; pointer-events: none;
      font-family: sans-serif; transition: opacity 0.2s; opacity: 0.85;
    `;
    badge.setAttribute('aria-live', 'polite');
    badge.style.userSelect = 'none';
    badge.style.display = 'block';
    badge.style.minWidth = '32px';
    badge.style.textAlign = 'center';
    badge.style.fontWeight = 'bold';
    badge.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
    // Position badge in video container
    const parent = video.parentElement;
    parent.style.position = 'relative';
    parent.appendChild(badge);
    video._speedBadge = badge;
  }
  return badge;
}

function showSpeed(video, speed) {
  const badge = createSpeedBadge(video);
  badge.textContent = speed.toFixed(2) + '×';
  badge.style.opacity = '0.85';
  clearTimeout(badge._hideTimer);
  badge._hideTimer = setTimeout(() => {
    badge.style.opacity = '0';
  }, 1200);
}

function setSpeed(video, speed, show = true) {
  speed = Math.max(0.07, Math.min(speed, 16));
  video.playbackRate = speed;
  if (show) showSpeed(video, speed);
  
  // Notify background script about speed change to update icon
  console.log('Content: sending speedChanged message with speed:', speed);
  chrome.runtime.sendMessage({
    type: 'speedChanged',
    speed: speed
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Content: Error sending speed message:', chrome.runtime.lastError);
    } else {
      console.log('Content: Speed message sent successfully:', response);
    }
  });
  
  if (settings.rememberPerSite) {
    const key = 'speed_' + location.hostname;
    chrome.storage.local.set({[key]: speed});
  }
}

function handleKey(e) {
  if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
  const video = getActiveVideo();
  if (!video) return;
  let handled = false;
  if (e.key === settings.decreaseKey) {
    setSpeed(video, video.playbackRate - (settings.increment/100));
    handled = true;
  } else if (e.key === settings.increaseKey) {
    setSpeed(video, video.playbackRate + (settings.increment/100));
    handled = true;
  } else if (e.key === settings.resetKey) {
    setSpeed(video, 1.0);
    handled = true;
  }
  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
}

document.addEventListener('keydown', handleKey, true);

// Observe new videos
const observer = new MutationObserver(() => {
  getVideos().forEach(video => {
    if (!video._fspeedInit) {
      video._fspeedInit = true;
      // Set default speed if needed
      if (settings.defaultSpeed && video.playbackRate !== settings.defaultSpeed) {
        setSpeed(video, settings.defaultSpeed, false);
      }
      video.addEventListener('ratechange', () => {
        showSpeed(video, video.playbackRate);
        // Update icon when rate changes externally
        console.log('Content: video rate changed to:', video.playbackRate);
        chrome.runtime.sendMessage({
          type: 'speedChanged',
          speed: video.playbackRate
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Content: Error sending rate change message:', chrome.runtime.lastError);
          } else {
            console.log('Content: Rate change message sent successfully:', response);
          }
        });
      });
    }
  });
});
observer.observe(document.body, {childList: true, subtree: true});

// Initial setup
getVideos().forEach(video => {
  if (!video._fspeedInit) {
    video._fspeedInit = true;
    if (settings.defaultSpeed && video.playbackRate !== settings.defaultSpeed) {
      setSpeed(video, settings.defaultSpeed, false);
    } else {
      // Update icon with current speed even if not changing it
      chrome.runtime.sendMessage({
        type: 'speedChanged',
        speed: video.playbackRate
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content: Error sending initial speed:', chrome.runtime.lastError);
        } else {
          console.log('Content: Initial speed sent:', video.playbackRate);
        }
      });
    }
    video.addEventListener('ratechange', () => {
      showSpeed(video, video.playbackRate);
      // Update icon when rate changes externally
      console.log('Content: video rate changed to:', video.playbackRate);
      chrome.runtime.sendMessage({
        type: 'speedChanged',
        speed: video.playbackRate
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content: Error sending rate change message:', chrome.runtime.lastError);
        } else {
          console.log('Content: Rate change message sent successfully:', response);
        }
      });
    });
  }
});

// Try to restore last speed per site
if (settings.rememberPerSite) {
  const key = 'speed_' + location.hostname;
  chrome.storage.local.get([key], (res) => {
    if (res[key]) {
      getVideos().forEach(v => {
        setSpeed(v, res[key], false);
      });
    }
  });
}

// Minimal CSS for badge
const style = document.createElement('style');
style.textContent = `.fspeed-badge { pointer-events: none; }`;
document.head.appendChild(style);
