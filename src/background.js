/*global chrome*/

import { PORT_NAME_DEFAULT, MESSAGE_STASH_POP } from "./util/constants";
import {
  MESSAGE_DETACH,
  MESSAGE_MOVE,
  MESSAGE_DUPLICATE,
  MESSAGE_NAVIGATE_UNPINNED,
  MESSAGE_STASH,
  MESSAGE_ADJ_TAB_SELECTION
} from "./util/constants";
import detachTabs from "./chrome/tabs/detachTabs";
import moveTabs from "./chrome/tabs/moveTabs";
import duplicateCurrentTab from "./chrome/tabs/duplicateCurrentTab";
import navigateToUnpinnedTab from "./chrome/tabs/navigateToUnpinnedTab";
import restoreTabs from "./chrome/tabs/restoreTabs";
import reloadTabs from "./chrome/tabs/reloadTabs";
import toggleAdjacentTabSelection from "./chrome/tabs/toggleAdjacentTabSelection"
import StashEntrySource from "./data/source/StashEntrySource";

const stashEntrySource = StashEntrySource();

chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message.type == MESSAGE_DETACH) detachTabs();
      else if (message.type == MESSAGE_MOVE) moveTabs(message.offset);
      else if (message.type == MESSAGE_DUPLICATE) duplicateCurrentTab();
      else if (message.type == MESSAGE_NAVIGATE_UNPINNED)
        navigateToUnpinnedTab(message.offset);
      else if (message.type == MESSAGE_STASH) stashTabs();
      else if (message.type == MESSAGE_STASH_POP) popTabs(message.stashKey);
      else if (message.type == MESSAGE_ADJ_TAB_SELECTION) toggleAdjacentTabSelection(message.offset)
    });
});

function popTabs(stashKey) {
  chrome.storage.sync.get({ [stashKey]: {} }, items => {
    restoreTabs(items[stashKey].map(({ url }) => url), () => {
      chrome.storage.sync.remove(stashKey);
    });
  });
}

function stashTabs() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    const ids = []
    const entries = []
    for (const { id, title, url } of tabs) {
      ids.push(id)
      entries.push({ title, url })
    }
    chrome.tabs.remove(ids, () => {
      stashEntrySource.addStashEntries(entries);
    })
  });
}

chrome.runtime.onMessageExternal.addListener((request, sender, response) => {
  console.debug(request)
  switch (request.type) {
    case "action spec":
      response({
        name: actionSpec.name,
        actions: Object.entries(actionSpec.actions)
          .map(([name, { displayName }]) => {
            return { name, displayName }
          })
      })
      break;
    case "execute action":
      const action = actionSpec.actions[request.action.name]
      const ctx = { sender }
      if (action !== undefined)
        action.f(ctx)
      break
    case "select/response":
      if (request.cancelled || request.selected === undefined) return;
      console.log("request.selected:", request.selected);
      activateTab(parseInt(request.selected))
      break;
  }
  if (request.type === "action spec") {
    response({
      name: actionSpec.name,
      actions: Object.entries(actionSpec.actions)
        .map(([name, { displayName }]) => {
          return { name, displayName }
        })
    })
  } else if (request.type === "execute action") {
    const action = actionSpec.actions[request.action.name]
    const ctx = { sender }
    if (action !== undefined)
      action.f(ctx)
  }
});

const actionSpec = {
  name: "WiNager",
  actions: {
    "list stash entries": {
      displayName: "List Stash Entries",
      f: requestOpenStashModal
    },
    "detach": {
      displayName: "Detach Tabs",
      f: detachTabs
    },
    "duplicate": {
      displayName: "Duplicate Tab",
      f: duplicateCurrentTab
    },
    "stash": {
      displayName: "Stash Tabs",
      f: stashTabs
    },
    "pin": {
      displayName: "Toggle Pins",
      f: togglePinnedStates
    },
    "reload": {
      displayName: "Reload All Tabs",
      f: reloadAllTabs
    },
    "select all": {
      displayName: "Select All Tabs",
      f: selectAllTabs
    },
    "clear selection": {
      displayName: "Clear Tab Selection",
      f: clearSelection
    },
    "reopen in incognito mode": {
      displayName: "Reopen in Incognito Mode",
      f: reopenInIncognitoMode
    },
    "go to": {
      displayName: "Go to ...",
      f: moveActiveTab
    }
  }
};

function requestOpenStashModal() {
  console.debug('requestOpenStashModal')
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "list stash entries" })
  })
}

function togglePinnedStates() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    const tabIds = []
    const updates = []
    for (const { id, pinned } of tabs) {
      tabIds.push(id)
      updates.push({ pinned: !pinned })
    }
    updateTabs(tabIds, updates)
  })
}

function reloadAllTabs() {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    reloadTabs(tabs.map(({ id }) => id))
  })
}

function updateTabs(tabIds, updates, callback) {
  function _updateTabs(tabIds, updates, updatedTabs, callback) {
    if (tabIds.length === 0) callback && callback(updatedTabs)
    else {
      const [tabId, ...restOfTabIds] = tabIds
      const [update, ...restOfUpdates] = updates
      chrome.tabs.update(tabId, update, updatedTab => {
        _updateTabs(restOfTabIds, restOfUpdates, [...updatedTabs, updatedTab], callback)
      })
    }
  }
  if (tabIds.length > 0) _updateTabs(tabIds, updates, [], callback)
}

function selectAllTabs() {
  queryActiveTab(activeTab => {
    chrome.tabs.query({ highlighted: false, currentWindow: true }, tabs => {
      if (tabs.length === 0) return
      updateTabs(
        tabs.map(({ id }) => id),
        new Array(tabs.length).fill({ highlighted: true }),
        // TODO: The restoration of active state seems in effect identical to 
        // activating the tab.... So, activateTab may be usable?
        () => _restoreActiveState(activeTab)
      )
    })
  })
  function _restoreActiveState(tab) {
    // Little hack to obtain again the active state of which the active tab 
    // at the moment of performing the action is deprived.
    _toggleHighlightedState(tab,
      tab => _toggleHighlightedState(tab))
  }
  function _toggleHighlightedState(tab, callback) {
    chrome.tabs.update(tab.id, { highlighted: !tab.highlighted }, tab => callback && callback(tab))
  }
}

function queryActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => callback && callback(tab))
}

function clearSelection() {
  chrome.tabs.query({ highlighted: true, active: false, currentWindow: true }, tabs => {
    updateTabs(
      tabs.map(({ id }) => id),
      new Array(tabs.length).fill({ highlighted: false })
    )
  })
}

function reopenInIncognitoMode() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    const urls = []
    const ids = []
    for (const { id, url } of tabs) {
      urls.push(url)
      ids.push(id)
      chrome.history.deleteUrl({ url })
    }
    chrome.windows.create({ incognito: true, url: urls })
    chrome.tabs.remove(ids)
  })
}

function moveActiveTab(ctx) {
  console.debug("moving active tab (UD)")
  getTabActivity(tabActivity => {
    console.debug(tabActivity)
    const selectOptions = tabActivity.map(th => ({ value: th.id, displayName: th.title + " " + th.hostname }))
    sendSelectOptions(ctx, selectOptions)
  })
}

var TabActivity = undefined // An in-memory cache of the activity to prevent phantom read

chrome.runtime.onInstalled.addListener(() => {
  // // The following code is for development to clear up the activity
  // chrome.storage.sync.remove("tabActivity", () => {
  //   TabActivity = {}
  // })
  chrome.storage.sync.get({ tabActivity: {} }, ({ tabActivity }) => {
    console.debug("Installing tab activity")
    console.debug(tabActivity)
    TabActivity = tabActivity
  })
})

chrome.tabs.onActivated.addListener(activeInfo => {
  console.debug('Recording tab activity')
  const now = Date.now()
  console.debug(activeInfo.tabId, now)
  console.debug('Updating tab activity')
  if (!TabActivity) {
    console.error("In-memory cache of the tab activity expected to be initialized")
    return
  }
  TabActivity[activeInfo.tabId] = now
  console.debug(TabActivity)
  chrome.storage.sync.set({ tabActivity: TabActivity })
})

chrome.tabs.onRemoved.addListener(tabId => {
  console.debug('Clearing up tab entry')
  console.debug(tabId)
  if (!TabActivity) {
    console.error("In-memory cache of the tab activity expected to be initialized")
    return
  }
  delete TabActivity[tabId]
  chrome.storage.sync.set({ tabActivity: TabActivity })
  console.debug(TabActivity)
})

function getTabActivity(callback) {
  console.debug("Retrieving tab activity")
  chrome.storage.sync.get({ tabActivity: {} }, ({ tabActivity }) => {
    const activityHistoryRaw = Object.entries(tabActivity).sort(([_, timestamp], [_1, timestamp1]) =>
      timestamp1 - timestamp)
    console.debug("Obtaining tab activity: activityHistoryRaw:", activityHistoryRaw)
    const tabIds = activityHistoryRaw.map(([id, _]) => parseInt(id))
    getTabs(tabIds, tabs => {
      console.debug("Obtaining tab activity: tabs:", tabs)
      const tabHistory = tabs.map((tab, i) => {
        const [id, timestamp] = activityHistoryRaw[i]
        return { id, timestamp, title: tab.title, hostname: new URL(tab.url).hostname }
      })
      callback(tabHistory)
    })
  })
}

function getTabs(ids, callback) {
  function $getTabs(ids, tabs, callback) {
    if (ids.length === 0) {
      callback(tabs)
      return
    }
    const [head, ...tail] = ids
    chrome.tabs.get(head, tab => $getTabs(tail, [...tabs, tab], callback))
  }
  $getTabs(ids, [], callback)
}

function sendSelectOptions(ctx, options) {
  chrome.runtime.sendMessage(ctx.sender.id, {
    type: "select",
    options
  });
}

function activateTab(id) {
  chrome.tabs.update(id, {active: true})
}