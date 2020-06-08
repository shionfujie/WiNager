function detachTabs() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    moveTabsToNewWindow(tabs.map(({ id }) => id));
  });
}

function moveTabsToNewWindow(tabIds) {
  chrome.windows.create(null, window => {
    const windowId = window.id;
    chrome.tabs.move(tabIds, { windowId, index: -1 }, () =>
      removeTabByIndex(0, windowId)
    );
  });
}
