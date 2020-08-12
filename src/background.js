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
    for (const {id, title, url} of tabs) {
      ids.push(id)
      entries.push({title, url})
    }
    chrome.tabs.remove(ids, () => {
      stashEntrySource.addStashEntries(entries);
    })
  });
}

const actionSpec = {
  name: "WiNager",
  actions: [
    {
      name: "list stash entries",
      displayName: "List Stash Entries"
    },
    {
      name: "detach",
      displayName: "Detach Tabs"
    },
    {
      name: "duplicate",
      displayName: "Duplicate Current Tab"
    },
    {
      name: "stash",
      displayName: "Stash Tabs"
    }
  ]
};

chrome.runtime.onMessageExternal.addListener((request, _, response) => {
  console.debug(request)
  if (request.type === "action spec") {
    response(actionSpec)
  } else if (request.type === "execute action") {
    switch (request.action.name) {
      case "detach":
        detachTabs()
        break
      case "duplicate":
        duplicateCurrentTab()
        break;
      case "stash":
        stashTabs()
        break
      case "list stash entries":
        requestOpenStashModal()
        break;
    }
  }
});

function requestOpenStashModal() {
  console.debug('requestOpenStashModal')
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, {type: "list stash entries"})
  })
}