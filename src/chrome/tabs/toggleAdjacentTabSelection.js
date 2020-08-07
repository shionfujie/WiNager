/*global chrome*/
export default function toggleAdjacentTabSelection(offset) {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    const tabCount = tabs.length;
    const currentTab = tabs.find(tab => tab.active);
    const targetTab = tabs[(tabCount + currentTab.index + offset) % tabCount];
    if (targetTab.highlighted)
      chrome.tabs.update(currentTab.id, { highlighted: false });
    else chrome.tabs.update(targetTab.id, { highlighted: true });
  });
}
