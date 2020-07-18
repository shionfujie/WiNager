const port = chrome.runtime.connect({name: PORT_NAME_DEFAULT})

document.onkeydown = ({code, shiftKey, ctrlKey}) => {
    if (port === null) return
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
        console.log("detachtabs")
        port.postMessage(detachTab())
    } else if ((code == "ArrowRight" || code == "ArrowLeft") && shiftKey && ctrlKey) {
        console.log("movetabs")
        port.postMessage(moveTab(code == "ArrowRight" ? 1 : - 1))
    }
}