/*global chrome*/

export default function restoreTabs(urls, callback) {
  if (urls.length == 0) callback();
  else {
    const [url, ...rest] = urls;
    chrome.tabs.create({ url }, () => {
      restoreTabs(rest, callback);
    });
  }
}
