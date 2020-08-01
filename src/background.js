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
import duplicateCurrentTab from "./chrome/tabs/duplicateCurrentTab"
import navigateToUnpinnedTab from "./chrome/tabs/navigateToUnpinnedTab";
import stashTabs from "./chrome/tabs/stashTabs";
import restoreTabs from "./chrome/tabs/restoreTabs";

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

function popTabs(stashKey) {
  chrome.storage.sync.get({[stashKey]: {}}, items => {
    restoreTabs(items[stashKey].map(({url}) => url), () => {
      chrome.storage.sync.remove(stashKey)
    })
  })
}
