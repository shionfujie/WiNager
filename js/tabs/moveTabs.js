function moveTabs(offset) {
  chrome.tabs.query({ currentWindow: true }, tabs => {
    const countOfTabs = tabs.length;
    const countOfPinned = tabs.filter(tab => tab.pinned).length;
    const countOfUnpinned = countOfTabs - countOfPinned;
    const highlightedTabs = tabs.filter(tab => tab.highlighted);
    const newIndex = (index, pinned) => {
      if (pinned) return (index + offset) % countOfPinned;
      else {
        const relativeIndex =
          (index - countOfPinned + offset) % countOfUnpinned;
        return relativeIndex < 0 ? -1 : countOfPinned + relativeIndex;
      }
    };
    const idsAndIndices = highlightedTabs.map(({ id, index, pinned }) => 
        [id,newIndex(index, pinned)]);
    moveTabsIncrementally(offset > 0 ? idsAndIndices.reverse() : idsAndIndices);
  });
}

function moveTabsIncrementally(idsAndIndices) {
  if (idsAndIndices.length == 0) return
  const [[id, index], ...rest] = idsAndIndices;
  chrome.tabs.move(id, { index }, () => {
    moveTabsIncrementally(rest);
  });
}
