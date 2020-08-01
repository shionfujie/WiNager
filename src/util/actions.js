import {
  MESSAGE_DETACH,
  MESSAGE_MOVE,
  MESSAGE_DUPLICATE,
  MESSAGE_NAVIGATE_UNPINNED,
  MESSAGE_STASH,
  MESSAGE_STASH_POP
} from "./constants";
import { func } from "prop-types";

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
