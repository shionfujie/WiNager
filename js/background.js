chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message.type == MESSAGE_DETACH) detachTabs();
      else if (message.type == MESSAGE_MOVE) moveTabs(message.offset)
      else if (message.type == MESSAGE_DUPLICATE) duplicateCurrentTab()
      else if (message.type == MESSAGE_NAVIGATE_UNPINNED) navigateToUnpinnedTab(message.offset)
      else if (message.type == MESSAGE_STASH) stashTabs()
    });
});


function duplicateCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
      chrome.tabs.duplicate(tab.id)
  })
}

function stashTabs() {
  chrome.tabs.query({highlighted: true, currentWindow: true}, tabs => {
    const entries = tabs.map(({title, url}) => ({ title, url}))
    chrome.storage.sync.set({[new Date().toISOString()]: entries}, () => {
      chrome.storage.sync.get(null, items => {
        console.log(items)
        chrome.storage.sync.clear()
      })
    })
  })
}