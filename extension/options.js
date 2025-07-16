// options.js
// Handles settings UI and storage

const DEFAULT_SETTINGS = {
  decreaseKey: '[',
  increaseKey: ']',
  resetKey: 'r',
  increment: 5,
  rememberPerSite: false,
  defaultSpeed: 1.0
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const fields = ['decreaseKey','increaseKey','resetKey','increment','rememberPerSite','defaultSpeed'];

  function loadSettings() {
    chrome.runtime.sendMessage({type: 'getSettings'}, (settings) => {
      const mergedSettings = {...DEFAULT_SETTINGS, ...settings};
      fields.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;
        if (el.type === 'checkbox') {
          el.checked = !!mergedSettings[f];
        } else {
          el.value = mergedSettings[f] !== undefined ? mergedSettings[f] : '';
        }
        highlightCustomValue(f, el, mergedSettings[f]);
      });
    });
  }

  function highlightCustomValue(fieldName, element, currentValue) {
    const isCustom = currentValue !== DEFAULT_SETTINGS[fieldName];
    if (isCustom) {
      element.classList.add('custom-value');
    } else {
      element.classList.remove('custom-value');
    }
  }

  function resetSetting(settingKey) {
    const element = document.getElementById(settingKey);
    const defaultValue = DEFAULT_SETTINGS[settingKey];
    
    if (!element) return;
    
    if (element.type === 'checkbox') {
      element.checked = defaultValue;
    } else {
      element.value = defaultValue;
    }
    element.classList.remove('custom-value');
  }

  function resetAllSettings() {
    fields.forEach(field => resetSetting(field));
  }

  function showSaveMessage() {
    const message = document.getElementById('saveMessage');
    message.classList.add('show');
    setTimeout(() => {
      message.classList.remove('show');
    }, 2000);
  }

  // Load initial settings
  loadSettings();

  // Add event listeners for input changes to highlight custom values
  fields.forEach(fieldName => {
    const element = document.getElementById(fieldName);
    if (!element) return;
    
    element.addEventListener('input', () => {
      let currentValue;
      if (element.type === 'checkbox') {
        currentValue = element.checked;
      } else if (element.type === 'number') {
        currentValue = parseFloat(element.value);
      } else {
        currentValue = element.value;
      }
      highlightCustomValue(fieldName, element, currentValue);
    });
  });

  // Individual reset buttons
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const setting = e.target.dataset.setting;
      resetSetting(setting);
    });
  });

  // Reset all button
  document.getElementById('resetAllBtn').addEventListener('click', () => {
    resetAllSettings();
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSettings = {};
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (!el) return;
      if (el.type === 'checkbox') {
        newSettings[f] = el.checked;
      } else if (el.type === 'number') {
        newSettings[f] = parseFloat(el.value);
      } else {
        newSettings[f] = el.value;
      }
    });
    chrome.runtime.sendMessage({type: 'setSettings', settings: newSettings}, () => {
      showSaveMessage();
    });
  });
});
