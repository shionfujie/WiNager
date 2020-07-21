chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message.type == MESSAGE_DETACH) detachTabs();
      else if (message.type == MESSAGE_MOVE) moveTabs(message.offset)
      else if (message.type == MESSAGE_DUPLICATE) duplicateCurrentTab()
    });
});


function duplicateCurrentTab() {
  chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
      chrome.tabs.duplicate(tab.id)
  })
}