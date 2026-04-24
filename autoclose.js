const CUTOFF_MS = 24 * 60 * 60 * 1000;
const ALARM_NAME = "autoclose-sweep";
const PERIOD_MINUTES = 60;
const NO_GROUP = chrome.tabGroups.TAB_GROUP_ID_NONE;

export function register() {
  chrome.runtime.onInstalled.addListener(ensureAlarm);
  chrome.runtime.onStartup.addListener(ensureAlarm);
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) sweep();
  });
  ensureAlarm();
}

async function ensureAlarm() {
  const existing = await chrome.alarms.get(ALARM_NAME);
  if (!existing) {
    await chrome.alarms.create(ALARM_NAME, { periodInMinutes: PERIOD_MINUTES });
  }
}

async function sweep() {
  const cutoff = Date.now() - CUTOFF_MS;
  const tabs = await chrome.tabs.query({ pinned: false });
  for (const tab of tabs) {
    if (tab.active) continue;
    if (tab.groupId !== NO_GROUP) continue;
    if (!tab.lastAccessed || tab.lastAccessed > cutoff) continue;
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // Tab may have been closed between query and remove.
    }
  }
}
