/*global chrome*/

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import "./css/content.css";
import {
  detachTab,
  moveTab,
  duplicate,
  navigateUnpinned,
  stash,
  popStashEntry
} from "./util/actions";
import { PORT_NAME_DEFAULT } from "./util/constants";
import usePort from "./hooks/chrome/usePort";
import useSwitch from "./hooks/useSwitch";
import useDocumentKeydown from "./hooks/useDocumentKeydown";

function Content() {
  const port = usePort(PORT_NAME_DEFAULT);
  const [stashModalIsOpen, openStashModal, closeStashModal] = useSwitch();
  useDocumentKeydown(({ code, shiftKey, ctrlKey, altKey, metaKey }) => {
    if (port === null) return;
    if (code == "ArrowDown" && shiftKey && ctrlKey) {
      port.postMessage(detachTab());
    } else if (
      (code == "BracketRight" || code == "BracketLeft") &&
      ctrlKey &&
      altKey &&
      metaKey
    ) {
      port.postMessage(moveTab(code == "BracketRight" ? 1 : -1));
    } else if (code == "KeyD" && altKey) port.postMessage(duplicate());
    else if (code.startsWith("Digit") && ctrlKey && altKey && metaKey)
      port.postMessage(navigateUnpinned(parseInt(code[5]) - 1));
    else if (code == "KeyS" && ctrlKey && altKey && metaKey) 
      port.postMessage(stash());
    else if (code == "KeyP" && ctrlKey && altKey && metaKey)
      openStashModal()
  });
  return <StashModal isOpen={stashModalIsOpen} onRequestClose={closeStashModal} chromePort={port}/>;
}

function StashModal({isOpen, onRequestClose, chromePort}) {
  const [data, setData] = useState(null)
  useEffect(() => {
    chrome.storage.sync.get(null, items => {
      console.log(items)
      setData(
        Object.entries(items)
          .map(([timestamp, entries]) => {
            const date = new Date(timestamp)
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
            }
          })
      )
    });
  }, [])
  const style = {
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
      boxShadow: "0 8px 10px 1px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2)"
    }
  }
  return (
    <ReactModal isOpen={data && isOpen} onRequestClose={onRequestClose} style={style}>
      {data && isOpen &&
        <StashList data={data} chromePort={chromePort} />
      }
    </ReactModal>
  );
}

function StashList({data, chromePort}) {
  function groupByDate(data) {
    return data.reduce((acc, {stashKey, date: {fullYear, month, date, day, ...time}, entries}) => {
      const last = acc[acc.length - 1]
      if (last && last.date.fullYear === fullYear && last.date.month === month && last.date.date === date) 
        last.entries.push({ time, entries })
      else 
        acc.push({
          stashKey,
          date: { fullYear, month, date, day },
          entries: [ { time, entries } ]
        })
      return acc
    }, [])
  }
  return (
    <div
      className={"flexbox flexbox-direction-column padding-horizontal-larger"}
    >
      {groupByDate(data).map(({stashKey, date, entries}) => 
        <>
          <StashDate
            fullYear={date.fullYear}
            month={date.month}
            date={date.date}
            day={date.day}
          />
          {entries.map(({time, entries}) => 
            <>
              <StashEntries
                stashKey={stashKey}
                hours={time.hours}
                minutes={time.minutes}
                entries={entries}
                chromePort={chromePort}
              />
              <Separator/>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Separator() {
  return <div class="border-shade-87 border-top-normal"></div>
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function StashDate({fullYear, month, date, day}) {
  function displayDate(fullYear, month, date, day) {
    const today = new Date();
    const thisYear = today.getFullYear();
    const commonPart = `${daysOfWeek[day]}, ${months[month]} ${date}`;
    if (
      fullYear == thisYear &&
      month == today.getMonth() &&
      date == today.getDate()
    )
      return `Today - ${commonPart}`;
    today.setDate(today.getDate() - 1);
    if (
      fullYear == today.getFullYear() &&
      month == today.getMonth() &&
      date == today.getDate()
    )
      return `Yesterday - ${commonPart}`;
    if (fullYear == thisYear) return `${commonPart}`;
    else return `${commonPart}, ${fullYear}`;
  }
  return (
    <div className={"flexbox flexbox-justify-center"}>
      <div
        className={
          "shade-087 font-size-huge font-weight-bold line-height-huge padding-top-extra-larger"
        }
      >
        {displayDate(fullYear, month, date, day)}
      </div>
    </div>
  );
}

function StashEntries({stashKey, hours, minutes, entries, chromePort}) {
  const count = entries.length;
  return (
    <div className={"padding-top-smaller padding-bottom-medium"}>
      <StashCaption hours={hours} minutes={minutes} count={count} />
      {entries.map(({ title, url }) => {
        return <StashEntry title={title} url={url} />;
      })}
      <RestoreButton onClick={() => {
        if (chromePort != null)
          chromePort.postMessage(popStashEntry(stashKey))
      }} count={count} />
    </div>
  );
}

function StashCaption({hours, minutes, count}) {
  function displayTime(hours, minutes) {
    const q = Math.floor(hours / 12);
    const r = hours % 12;
    const mm = `${minutes}`.padStart(2, "0");
    if (q < 1) return `${hours}:${mm} AM`;
    else if (r == 0) return `12:${mm} PM`;
    else return `${r}:${mm} PM`;
  }
  return (
    <div className={"padding-vertical-medium"}>
      <div class="shade-087 font-size-larger font-weight-bold line-height-medium">
        {displayTime(hours, minutes)}
      </div>
      <div class="shade-056 font-size-small font-weight-medium line-height-medium">
        {count} items
      </div>
    </div>
  );
}

function StashEntry({title, url}) {
  return (
    <div class="shade-087 font-size-medium font-weight-medium padding-vertical-smaller line-height-medium">
      <div
        class="pointer overflow-ellipsis"
        title={`${title} - ${url}`}
      >
        {title}
      </div>
    </div>
  );
}

function RestoreButton({count, onClick}) {
  return (
    <div class="inline-block padding-top-larger padding-bottom-medium">
      <div 
        onClick={onClick}
        class="pointer underline font-size-medium font-weight-bold line-height-medium winager-primary">
        Restore all {count} items
      </div>
    </div>
  );
}

const app = document.createElement("div");
app.id = "my-extension-root";
document.body.appendChild(app);
ReactDOM.render(<Content />, app);
