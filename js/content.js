const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey, metaKey}) => {
    if (port === null) return
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        port.postMessage(detachTab())
    } else if ((code == "ArrowRight" || code == "ArrowLeft") && shiftKey && metaKey) {
        port.postMessage(moveTab(code == "ArrowRight" ? 1 : - 1))
    }
}