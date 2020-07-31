/*global chrome*/

export default function stashTabs() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    const entries = tabs.map(({ title, url }) => ({ title, url }));
    const timestamp = new Date().toISOString();
    chrome.storage.sync.set({ [timestamp]: entries }, () => {
      chrome.storage.sync.get(null, items => {
        console.log(items);
      });
    });
  });
}
