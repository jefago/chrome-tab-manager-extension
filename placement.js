const NO_GROUP = chrome.tabGroups.TAB_GROUP_ID_NONE;

export function register() {
  chrome.tabs.onCreated.addListener(handleCreated);
}

async function handleCreated(tab) {
  if (tab.pinned) return;
  if (tab.groupId !== undefined && tab.groupId !== NO_GROUP) return;

  if (tab.openerTabId !== undefined) {
    const opener = await safeGetTab(tab.openerTabId);
    if (opener && opener.groupId !== NO_GROUP) {
      try {
        await chrome.tabs.group({ groupId: opener.groupId, tabIds: [tab.id] });
      } catch {
        // Tab may have closed between onCreated and grouping; ignore.
      }
      return;
    }
  }

  const targetIndex = await computeAfterAllGroupsIndex(tab.windowId);
  if (tab.index < targetIndex) {
    try {
      await chrome.tabs.move(tab.id, { index: targetIndex });
    } catch {
      // Tab may have been closed or relocated by the user / another extension.
    }
  }
}

async function computeAfterAllGroupsIndex(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  let maxIndex = -1;
  for (const t of tabs) {
    if (t.pinned || t.groupId !== NO_GROUP) {
      if (t.index > maxIndex) maxIndex = t.index;
    }
  }
  return maxIndex + 1;
}

async function safeGetTab(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}
