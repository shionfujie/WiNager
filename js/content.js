const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey, altKey, metaKey}) => {
    console.log(code)
    if (port === null) return
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        port.postMessage(detachTab())
    } else if ((code == "BracketRight" || code == "BracketLeft") && ctrlKey && altKey && metaKey) {
        port.postMessage(moveTab(code == "BracketRight" ? 1 : - 1))
    } else if (code == "KeyD" && altKey)
        port.postMessage(duplicate())
    else if (code.startsWith("Digit") && ctrlKey && altKey && metaKey)
        port.postMessage(navigateUnpinned(parseInt(code[5]) - 1))
}