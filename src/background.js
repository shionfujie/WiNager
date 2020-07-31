/*global chrome*/

import { PORT_NAME_DEFAULT, MESSAGE_STASH_POP } from "./util/constants";
import {
  MESSAGE_DETACH,
  MESSAGE_MOVE,
  MESSAGE_DUPLICATE,
  MESSAGE_NAVIGATE_UNPINNED,
  MESSAGE_STASH
} from "./util/constants";
import detachTabs from "./chrome/tabs/detachTabs";
import moveTabs from "./chrome/tabs/moveTabs";
import navigateToUnpinnedTab from "./chrome/tabs/navigateToUnpinnedTab";
import stashTabs from "./chrome/tabs/stashTabs";

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
    });
});

function duplicateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.duplicate(tab.id);
  });
} 

function popTabs(stashKey) {
  chrome.storage.sync.get({[stashKey]: {}, last: {}}, items => {
    const {entries} = items[stashKey]
    console.log(entries)
    restoreTabs(entries, () => {
      chrome.storage.sync.remove(stashKey)
    })
  })
}

function restoreTabs(entries, callback) {
  if (entries.length == 0) 
    callback()
  else {
    const [{url}, ...rest] = entries
    chrome.tabs.create({url}, () => {
      restoreTabs(rest, callback)
    })
  }
}
