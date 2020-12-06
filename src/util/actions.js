import {
  MESSAGE_DETACH,
  MESSAGE_MOVE,
  MESSAGE_DUPLICATE,
  MESSAGE_NAVIGATE_UNPINNED,
  MESSAGE_STASH,
  MESSAGE_STASH_POP,
  MESSAGE_ADJ_TAB_SELECTION,
  MESSAGE_GO_FORWARD,
  MESSAGE_GO_BACK
} from "./constants";

export function detachTab() {
  return {
    type: MESSAGE_DETACH
  };
}

export function moveTab(offset) {
  return {
    type: MESSAGE_MOVE,
    offset
  };
}

export function duplicate() {
  return {
    type: MESSAGE_DUPLICATE
  };
}

export function navigateUnpinned(offset) {
  return {
    type: MESSAGE_NAVIGATE_UNPINNED,
    offset
  };
}

export function stash() {
  return {
    type: MESSAGE_STASH
  };
}

export function popStashEntry(stashKey) {
  return {
    type: MESSAGE_STASH_POP,
    stashKey
  }
}

export function toggleAdjacentTabSelection(offset) {
  return {
    type: MESSAGE_ADJ_TAB_SELECTION,
    offset
  }
}

export function goForward() {
  return {
    type: MESSAGE_GO_FORWARD
  }
}

export function goBack() {
  return {
    type: MESSAGE_GO_BACK
  }
}