# Tab Manager

Personal Chrome extension (macOS, MV3) with three behaviors:

1. **New-tab placement** — new tabs land after all tab groups, unless opened from within a group (then they inherit that group).
2. **MRU switcher** — `Ctrl+Space` jumps to the most recently used tab in the same window (Alt-Tab style toggle).
3. **Auto-close** — ungrouped, unpinned tabs that haven't been focused in 24 h are closed automatically (hourly sweep).

## Install

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked** and pick this folder.
4. The extension is active immediately. No popup / options page.

Requires Chrome 121 or newer (uses `tab.lastAccessed`).

## Ctrl+Space on macOS — important

The default shortcut is bound to the literal **Control+Space** (not Command+Space, which is Spotlight). macOS also binds `Ctrl+Space` system-wide to **"Select the previous input source"** (Keyboard → Shortcuts → Input Sources). That system shortcut fires *before* Chrome, so the extension will never see the key unless you disable it:

1. System Settings → Keyboard → Keyboard Shortcuts → Input Sources.
2. Uncheck **Select the previous input source**.

To pick a different shortcut, go to `chrome://extensions/shortcuts` and rebind "Switch to most recently used tab". `Ctrl+Tab` itself is reserved by Chrome and cannot be assigned.

## Notes on behavior

- Auto-close uses `chrome.tabs.remove`. Pages with `beforeunload` handlers may or may not prompt depending on Chrome's current behavior; if you have something unsaved in a tab, don't let it go idle for 24 h.
- MRU state is per-window and cleared on browser restart.
- Pinned tabs are never moved or closed.
