/*global chrome*/

export default function duplicateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.duplicate(tab.id);
  });
}
