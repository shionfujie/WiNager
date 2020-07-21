const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey}) => {
    if (port === null) return
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        port.postMessage(detachTab())
    } else if ((code == "ArrowRight" || code == "ArrowLeft") && shiftKey && ctrlKey) {
        port.postMessage(moveTab(code == "ArrowRight" ? 1 : - 1))
    }
}