/*global chrome*/
export default function reloadTabs(tabIds, callback) {
  function _reloadTabs(tabIds, callback) {
    if (tabIds.length === 0) callback && callback();
    else {
      const [tabId, ...restOfTabIds] = tabIds;
      chrome.tabs.reload(tabId, () => {
        _reloadTabs(restOfTabIds, callback);
      });
    }
  }
  if (tabIds.length > 0) _reloadTabs(tabIds, callback);
}
