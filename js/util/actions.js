function detachTab() {
    return {
        type: MESSAGE_DETACH
    }
}

function moveTab(offset) {
    return {
        type: MESSAGE_MOVE,
        offset
    }
}

function duplicate() {
    return {
        type: MESSAGE_DUPLICATE
    }
}

function navigateUnpinned(offset) {
    return {
        type: MESSAGE_NAVIGATE_UNPINNED,
        offset
    }
}