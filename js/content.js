const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey}) => {
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        if (port === null) return
        port.postMessage(MESSAGE_DETACH)
    }
}