/*global chrome*/

export default function StashEntrySource() {
  function addStashEntries(entries) {
    const timestamp = new Date().toISOString();
    chrome.storage.sync.set({ [timestamp]: entries }, () => {
      chrome.storage.sync.get(null, items => {
        console.debug(items);
      });
    });
  }

  return {addStashEntries}
}
