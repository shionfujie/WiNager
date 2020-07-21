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