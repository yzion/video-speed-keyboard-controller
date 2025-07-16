# Fast Slow Video Controller

A Chrome browser extension that enables precise control over HTML5 video playback speed using keyboard shortcuts.

## Core Features

### Keyboard Control
- `[` key: Decrease playback speed by 5%
- `]` key: Increase playback speed by 5%
- `r` key: Reset speed to 1× (optional)

### Speed Indicator Overlay
- Shows current speed as a small, semi-transparent badge in the top-left corner of videos
- Automatically fades after 1.2 seconds
- Minimally intrusive design

### Customizable Settings
- Change keyboard shortcuts via options page
- Modify increment percentage (default 5%)
- Toggle per-site speed memory
- Set default playback speed for new videos

### Multi-video Support
- Detects and controls multiple HTML5 videos on the same page
- Applies shortcuts to the currently focused or playing video

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select the `extension` folder
4. The extension will be active on all pages with HTML5 videos

## Usage

1. Navigate to any page with HTML5 videos (YouTube, Vimeo, etc.)
2. Use `{` and `}` keys to decrease/increase speed
3. Use `r` to reset to normal speed
4. Speed changes are displayed in the top-left corner of videos
5. Access settings via the extension options page

## Settings

Right-click the extension icon and select "Options" to customize:
- Keyboard shortcuts for speed control
- Speed increment percentage
- Remember last speed per website
- Default playback speed for new videos

## Technical Details

- **Manifest V3** compliant
- Minimal permissions (storage, scripting)
- Clean separation of concerns (content script, background, options)
- Accessible design with ARIA live regions
- Works with dynamically loaded videos

## Files Structure

- `manifest.json`: Extension configuration
- `content.js`: Main functionality injected into web pages
- `background.js`: Service worker for settings management
- `options.html/js`: Settings page UI and logic

## Compatibility

- Chrome 88+ (Manifest V3)
- Firefox 109+ (with minor modifications)
- Works on all websites with HTML5 videos

## License

MIT License
