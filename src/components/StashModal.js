/*global chrome*/

import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import StashList from "./StashList";
import hasSameDate from "../util/dates/hasSameDate";

export default function StashModal({ isOpen, onRequestClose, chromePort }) {
  console.debug("rendering StashModal");
  const [data, setData] = useState(null);
  useEffect(() => {
    getStashEntries(data => setData(data));
  }, []);
  console.debug(`data: ${data}`);
  useEffect(() => {
    if (data === null) return;
    chrome.storage.onChanged.addListener((changes, namespace) => {
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
          const lastEntry = data[0];
          const entry = {
            stashKey,
            time: { hours: date.getHours(), minutes: date.getMinutes() },
            entries: change.newValue
          };
          if (hasSameDate(lastEntry.date, date)) {
            lastEntry.entries.unshift(entry);
          } else {
            data.unshift({
              date: {
                fullYear: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate(),
                day: date.getDay()
              },
              entries: [entry]
            });
          }
        } else if (change.newValue === undefined) {
          // Removed some existing entry
          const index = data.findIndex(entry => hasSameDate(date, entry.date));
          if (index < 0) return;
          const { entries } = data[index];
          const index1 = entries.findIndex(
            entry => stashKey === entry.stashKey
          );
          if (index1 < 0) return;
          entries.splice(index1, 1);
          if (entries.length === 0) data.splice(index, 1);
        } else {
          // Updated some existing entry
          console.error(
            "Unknown behaviour: update operation should not be supported"
          );
        }
      }
      setData([...data]);
    });
  }, [data == null]);
  return (
    <Modal isOpen={data && isOpen} onRequestClose={onRequestClose}>
      {data && isOpen && <StashList data={data} chromePort={chromePort} />}
    </Modal>
  );
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

function getStashEntries(callback) {
  function groupByDate(data) {
    return data.reduce(
      (
        acc,
        { stashKey, date: { fullYear, month, date, day, ...time }, entries }
      ) => {
        const last = acc[acc.length - 1];
        if (
          last &&
          last.date.fullYear === fullYear &&
          last.date.month === month &&
          last.date.date === date
        )
          last.entries.push({ stashKey, time, entries });
        else
          acc.push({
            date: { fullYear, month, date, day },
            entries: [{ stashKey, time, entries }]
          });
        return acc;
      },
      []
    );
  }
  chrome.storage.sync.get(null, items => {
    console.debug(items);
    callback(
      groupByDate(
        Object.entries(items)
          .sort(
            ([timestamp], [timestamp1]) => -timestamp.localeCompare(timestamp1)
          )
          .map(([timestamp, entries]) => {
            const date = new Date(timestamp);
            return {
              stashKey: timestamp,
              date: {
                fullYear: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate(),
                day: date.getDay(),
                hours: date.getHours(),
                minutes: date.getMinutes()
              },
              entries
            };
          })
      )
    );
  });
}
