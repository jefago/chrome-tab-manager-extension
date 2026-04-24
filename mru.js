const MAX_MRU = 20;
const COMMAND = "switch-to-previous-tab";

export function register() {
  chrome.tabs.onActivated.addListener(onActivated);
  chrome.tabs.onRemoved.addListener(onRemoved);
  chrome.windows.onRemoved.addListener(onWindowRemoved);
  chrome.commands.onCommand.addListener(onCommand);
  seedIfEmpty();
}

async function onActivated({ tabId, windowId }) {
  const list = await getMru(windowId);
  const next = [tabId, ...list.filter((id) => id !== tabId)];
  if (next.length > MAX_MRU) next.length = MAX_MRU;
  await setMru(windowId, next);
}

async function onRemoved(tabId, { windowId }) {
  const list = await getMru(windowId);
  const next = list.filter((id) => id !== tabId);
  if (next.length !== list.length) await setMru(windowId, next);
}

async function onWindowRemoved(windowId) {
  await chrome.storage.session.remove(keyFor(windowId));
}

async function onCommand(command) {
  if (command !== COMMAND) return;

  const [active] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!active) return;

  const list = await getMru(active.windowId);
  for (const id of list) {
    if (id === active.id) continue;
    const tab = await safeGetTab(id);
    if (tab && tab.windowId === active.windowId) {
      await chrome.tabs.update(id, { active: true });
      return;
    }
  }
}

async function seedIfEmpty() {
  const windows = await chrome.windows.getAll({ populate: true });
  for (const w of windows) {
    const existing = await getMru(w.id);
    if (existing.length > 0) continue;
    const activeTab = (w.tabs ?? []).find((t) => t.active);
    if (activeTab) await setMru(w.id, [activeTab.id]);
  }
}

function keyFor(windowId) {
  return `mru:${windowId}`;
}

async function getMru(windowId) {
  const key = keyFor(windowId);
  const obj = await chrome.storage.session.get(key);
  return obj[key] ?? [];
}

async function setMru(windowId, list) {
  await chrome.storage.session.set({ [keyFor(windowId)]: list });
}

async function safeGetTab(tabId) {
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}
