// options.js
// Handles settings UI and storage

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settingsForm');
  const fields = ['decreaseKey','increaseKey','resetKey','increment','rememberPerSite','defaultSpeed'];

  chrome.runtime.sendMessage({type: 'getSettings'}, (settings) => {
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (!el) return;
      if (el.type === 'checkbox') {
        el.checked = !!settings[f];
      } else {
        el.value = settings[f] !== undefined ? settings[f] : '';
      }
    });
  });

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
      alert('Settings saved!');
    });
  });
});
