function removeTabByIndex(index, windowId) {
  chrome.tabs.query({ windowId, index }, ([{ id }]) => {
    chrome.tabs.remove(id);
  });
}
