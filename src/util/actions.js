import {
  MESSAGE_DETACH,
  MESSAGE_MOVE,
  MESSAGE_DUPLICATE,
  MESSAGE_NAVIGATE_UNPINNED,
  MESSAGE_STASH
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
