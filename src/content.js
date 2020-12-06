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
  toggleAdjacentTabSelection,
  goForward,
  goBack
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
    const action = mapEventToAction(event)
    switch(true) {
      case port === null:
        return
      case code == "KeyP" && ctrlKey && altKey && metaKey:
        openStashModal();
        break;
      case code == "KeyC" && ctrlKey && metaKey:
        copyLinkAddress();
        break;
      case action !== null:
        port.postMessage(action)
    }
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
    case (code === "BracketRight" && ctrlKey && shiftKey):
      return goForward()
    case (code === "BracketLeft" && ctrlKey && shiftKey):
      return goBack()
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
