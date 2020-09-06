/*global chrome*/

import React from "react";
import ReactDOM from "react-dom";
import StashModal from "./components/StashModal";
import { StashEntrySourceProvider } from "./di/providers";
import "./css/content.css";
import {
  detachTab,
  moveTab,
  duplicate,
  navigateUnpinned,
  stash,
  popStashEntry,
  toggleAdjacentTabSelection
} from "./util/actions";
import { PORT_NAME_DEFAULT } from "./util/constants";
import usePort from "./hooks/chrome/usePort";
import useSwitch from "./hooks/useSwitch";
import useDocumentKeydown from "./hooks/useDocumentKeydown";
import copyLinkAddress from "./usecases/content/copyLinkAddress";

function Content() {
  const port = usePort(PORT_NAME_DEFAULT);
  const [stashModalIsOpen, openStashModal, closeStashModal] = useSwitch();
  useDocumentKeydown(event => {
    const {code, ctrlKey, altKey, metaKey} = event 
    if (port === null) return;

    if (code == "KeyP" && ctrlKey && altKey && metaKey) openStashModal();
    else if (code == "KeyC" && ctrlKey && metaKey) copyLinkAddress();

    const action = mapEventToAction(event)
    if (action !== null) port.postMessage(mapEventToAction(event))
  })
  chrome.runtime.onMessage.addListener(({type}) => {
    if (type === "list stash entries") openStashModal()
  })
  return (
    <StashModal
      isOpen={stashModalIsOpen}
      onRequestClose={closeStashModal}
      onRequestRestore={stashKey => {
        if (port != null) port.postMessage(popStashEntry(stashKey));
        closeStashModal()
      }}
    />
  );
}

function mapEventToAction({ code, shiftKey, ctrlKey, altKey, metaKey }) {
  if (code == "ArrowDown" && shiftKey && ctrlKey) {
    return detachTab();
  } else if (
    (code == "BracketRight" || code == "BracketLeft") &&
    ctrlKey &&
    altKey &&
    metaKey
  ) {
    return moveTab(code == "BracketRight" ? 1 : -1);
  } else if (code == "KeyD" && altKey) {
    return duplicate();
  } else if (code.startsWith("Digit") && ctrlKey && altKey && metaKey) {
    return navigateUnpinned(parseInt(code[5]) - 1);
  } else if (code == "KeyS" && ctrlKey && altKey && metaKey) {
    return stash();
  } else if (
    (code == "BracketRight" || code == "BracketLeft") &&
    ctrlKey &&
    metaKey
  ) {
    return toggleAdjacentTabSelection(code == "BracketRight" ? 1 : -1);
  }
  return null;
}

const app = document.createElement("div");
app.id = "winager-extension-root";
document.body.appendChild(app);
ReactDOM.render(
  <StashEntrySourceProvider>
    <Content />
  </StashEntrySourceProvider>,
  app
);
