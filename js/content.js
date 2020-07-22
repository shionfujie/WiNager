const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey, altKey, metaKey}) => {
    if (port === null) return
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        port.postMessage(detachTab())
    } else if ((code == "ArrowRight" || code == "ArrowLeft") && shiftKey && metaKey) {
        port.postMessage(moveTab(code == "ArrowRight" ? 1 : - 1))
    } else if (code == "KeyD" && altKey)
        port.postMessage(duplicate())
    else if (code.startsWith("Digit") && shiftKey && metaKey)
        port.postMessage(navigateUnpinned(parseInt(code[5]) - 1))
}