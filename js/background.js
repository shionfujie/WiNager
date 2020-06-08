chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message == MESSAGE_DETACH) {
        detachTabs();
      }
    });
});

function detachTabs() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    moveTabsToNewWindow(tabs.map(({id}) => id))
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

function removeTabByIndex(index, windowId) {
  chrome.tabs.query({ windowId, index }, ([{ id }]) => {
    chrome.tabs.remove(id);
  });
}
