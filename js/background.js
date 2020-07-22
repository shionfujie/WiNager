chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message.type == MESSAGE_DETACH) detachTabs();
      else if (message.type == MESSAGE_MOVE) moveTabs(message.offset)
      else if (message.type == MESSAGE_DUPLICATE) duplicateCurrentTab()
      else if (message.type == MESSAGE_NAVIGATE_UNPINNED)  navigateToUnpinnedTab(message.offset)
    });
});


function duplicateCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
      chrome.tabs.duplicate(tab.id)
  })
}

function navigateToUnpinnedTab(offset) {
  chrome.tabs.query({currentWindow: true}, tabs => {
    const index = tabs.filter(tab => tab.pinned).length + offset
    if (- 1 < index < tabs.length)
      chrome.tabs.update(tabs[index].id, {active: true})
  })
}