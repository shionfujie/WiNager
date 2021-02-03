/*global chrome*/

export default function queryActiveTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => callback && callback(tab))
}