/*global chrome*/

export default function stashTabs() {
  chrome.tabs.query({ highlighted: true, currentWindow: true }, tabs => {
    const entries = tabs.map(({ title, url }) => ({ title, url }));
    const timestamp = new Date().toISOString();
    chrome.storage.sync.get({ last: {} }, ({ last }) => {
      const next = last.timestamp;
      const payload = {
        last: { timestamp, entries, next },
        [timestamp]: { entries, next }
      };
      chrome.storage.sync.set(payload, () => {
        chrome.storage.sync.get(null, items => {
          console.log(items);
        });
      });
    });
  });
}
