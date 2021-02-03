/*global chrome*/

import queryActiveTab from "./queryActiveTab";
import removeTabByIndex from "./removeTabByIndex";
import updateTabs from "./updateTabs";

export default function detachTabs() {
  queryActiveTab(activeTab => {
    chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
      const ids = tabs.map(({ id }) => id)
      moveTabsToNewWindow(activeTab, ids);
    });
  })
}

export function moveTabsToNewWindow(activeTab, tabIds, callback) {
  chrome.windows.create(null, window => {
    const windowId = window.id;
    const update = new Array(tabIds.length).fill({ highlighted: true })
    chrome.tabs.move(tabIds, { windowId, index: -1 }, () => {
      updateTabs(tabIds.reverse(), update, () => {
        reactivate(activeTab)
        removeTabByIndex(0, windowId, callback)
      })
    });
  });

}

function reactivate(tab, callback) {
  // Little hack to obtain again the active state of which the active tab 
  // at the moment of performing the action is deprived.
  toggleHighlightedState(tab, tab => toggleHighlightedState(tab, callback))
}
function toggleHighlightedState(tab, callback) {
  chrome.tabs.update(tab.id, { highlighted: !tab.highlighted }, tab => callback && callback(tab))
}