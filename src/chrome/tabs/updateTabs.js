/*global chrome*/
export default function updateTabs(tabIds, updates, callback) {
    function _updateTabs(tabIds, updates, updatedTabs, callback) {
        if (tabIds.length === 0) callback && callback(updatedTabs)
        else {
            const [tabId, ...restOfTabIds] = tabIds
            const [update, ...restOfUpdates] = updates
            chrome.tabs.update(tabId, update, updatedTab => {
                _updateTabs(restOfTabIds, restOfUpdates, [...updatedTabs, updatedTab], callback)
            })
        }
    }
    if (tabIds.length > 0) _updateTabs(tabIds, updates, [], callback)
}