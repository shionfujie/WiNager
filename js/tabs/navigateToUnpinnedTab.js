function navigateToUnpinnedTab(offset) {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    const index = tabs.filter(tab => tab.pinned).length + offset;
    if (-1 < index < tabs.length)
      chrome.tabs.update(tabs[index].id, { active: true });
  });
}
