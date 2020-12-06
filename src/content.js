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
    if (action !== null) port.postMessage(action)
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
  switch (true) {
    case code == "ArrowDown" && shiftKey && ctrlKey:
      return detachTab();
    case (code == "BracketRight" || code == "BracketLeft") &&
      ctrlKey &&
      !altKey &&
      metaKey:
      return moveTab(code == "BracketRight" ? 1 : -1);
    case code == "KeyD" && altKey:
      return duplicate();
    case code.startsWith("Digit") && ctrlKey && altKey && metaKey:
      return navigateUnpinned(parseInt(code[5]) - 1);
    case code == "KeyS" && ctrlKey && altKey && metaKey:
      return stash();
    case (code == "BracketRight" || code == "BracketLeft") &&
      ctrlKey &&
      altKey &&
      metaKey:
      return toggleAdjacentTabSelection(code == "BracketRight" ? 1 : -1);
    default:
      return null
  }
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
