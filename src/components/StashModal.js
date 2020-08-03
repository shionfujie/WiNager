/*global chrome*/

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import { useStashEntrySource } from "../di/hooks";
import StashList from "./StashList";
import hasSameDate from "../util/dates/hasSameDate";

export default function StashModal({ isOpen, onRequestClose, chromePort }) {
  console.debug("rendering StashModal");
  const [uiModel, setUIModel] = useState(null);
  const stashEntrySource = useStashEntrySource()
  useEffect(() => {
    stashEntrySource.getStashEntries(data => setUIModel(UIModel(data)));
  }, []);
  useEffect(() => {
    if (uiModel === null) return;
    subscribeToStashEntryChanges(changes => {
      for (const change of changes) {
        if (change.type === "add") {
          uiModel.addEntry(change.date, change.entry);
        } else if (change.type === "remove") {
          uiModel.removeEntry(change.date, change.stashKey);
        }
      }
      setUIModel(uiModel.copy());
    });
  }, [uiModel == null]);
  return (
    <Modal isOpen={uiModel && isOpen} onRequestClose={onRequestClose}>
      {uiModel && isOpen && <StashList data={uiModel.data} chromePort={chromePort} />}
    </Modal>
  );
}

function UIModel(data) {
  function addEntry(date, entry) {
    const lastEntry = data[0];
    if (hasSameDate(lastEntry.date, date)) {
      lastEntry.entries.unshift(entry);
    } else {
      data.unshift({
        date: date,
        entries: [entry]
      });
    }
  }
  function removeEntry(date, stashKey) {
    const index = data.findIndex(entry => hasSameDate(date, entry.date));
    console.debug(index);
    if (index < 0) return;
    const { entries } = data[index];
    const index1 = entries.findIndex(entry => stashKey === entry.stashKey);
    console.debug(index1);
    if (index1 < 0) return;
    entries.splice(index1, 1);
    if (entries.length === 0) data.splice(index, 1);
  }
  function copy() {
    return { ...this };
  }
  return { data, addEntry, removeEntry, copy };
}

function subscribeToStashEntryChanges(callback) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    const result = [];
    for (const stashKey in changes) {
      const change = changes[stashKey];
      const date = new Date(stashKey);
      console.debug(
        "[STORAGE CHANGES] '%s' in '%s': old '%s' new '%s'",
        stashKey,
        namespace,
        change.oldValue,
        change.newValue
      );
      if (change.oldValue === undefined) {
        // Added a new stash entry
        result.push({
          type: "add",
          date: {
            fullYear: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
            day: date.getDay()
          },
          entry: {
            stashKey,
            time: { hours: date.getHours(), minutes: date.getMinutes() },
            entries: change.newValue
          }
        });
      } else if (change.newValue === undefined) {
        // Removed some existing entry
        result.push({
          type: "remove",
          date,
          stashKey
        });
      } else {
        // Updated some existing entry
        console.error(
          "Unknown behaviour: update operation should not be supported"
        );
      }
    }
    callback(result);
  });
}

function Modal({ isOpen, onRequestClose, children }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backgroundColor: "rgba(255, 255, 255, .0)",
          zIndex: 100000
        },
        content: {
          top: 8,
          right: 8,
          left: null,
          bottom: null,
          width: 480,
          height: "75%",
          border: 0,
          borderRadius: 2,
          boxShadow:
            "0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)"
        }
      }}
    >
      {children}
    </ReactModal>
  );
}
