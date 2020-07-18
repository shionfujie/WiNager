chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == PORT_NAME_DEFAULT)
    onMessage.addListener(message => {
      if (message.type == MESSAGE_DETACH) detachTabs();
      else if (message.type == MESSAGE_MOVE) moveTabs(message.offset)
    });
});

function moveTabs(offset) {
  function _moveTabs(idsAndIndices) {
    const [[id, index], ...rest] = idsAndIndices
    chrome.tabs.move(id, {index}, () => {
      _moveTabs(rest)
    })
  }
  chrome.tabs.query({ currentWindow: true }, tabs => {
    const countOfTabs = tabs.length
    const countOfPinned = tabs.filter(tab => tab.pinned).length
    const countOfUnpinned = countOfTabs - countOfPinned
    const highlightedTabs = tabs.filter(tab => tab.highlighted)
    const newIndex = (index, pinned) => {
      if (pinned) return (index + offset) % countOfPinned
      else {
        const relativeIndex = (index - countOfPinned + offset) % countOfUnpinned
        return relativeIndex < 0 ? - 1 : countOfPinned + relativeIndex
      }
    }
    const idsAndIndices = highlightedTabs.map(({ id, index, pinned }) => [id, newIndex(index, pinned)])
    _moveTabs(offset > 0 ? idsAndIndices.reverse() : idsAndIndices)
  });
}