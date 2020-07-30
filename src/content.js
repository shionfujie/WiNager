import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./css/content.css";
import {
  detachTab,
  moveTab,
  duplicate,
  navigateUnpinned,
  stash
} from "./util/actions";
import { PORT_NAME_DEFAULT } from "./util/constants";
import usePort from "./hooks/chrome/usePort";
import useDocumentKeydown from "./hooks/useDocumentKeydown";

function Content() {
  const port = usePort(PORT_NAME_DEFAULT);
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
    else if (code == "KeyS" && ctrlKey && altKey && metaKey) {
      port.postMessage(stash());
    }
  });
  return <StashListModal />;
}

function StashListModal() {
  return <StashList />;
}

function StashList() {
  const data = {
    date: {
      fullYear: 2020,
      month: 6,
      date: 30,
      day: 3,
      hours: 10,
      minutes: 0
    },
    entries: [
      {
        title: "Git - git-stash Documentation",
        url: "https://git-scm.com/docs/git-stash"
      },
      {
        title: "現地の人から借りる家、体験&スポット - Airbnb",
        url: "https://www.airbnb.jp/"
      },
      {
        title:
          "Basic classification: Classify images of clothing  |  TensorFlow Core",
        url:
          "https://www.tensorflow.org/tutorials/keras/classification?hl=en#import_the_fashion_mnist_dataset"
      }
    ]
  };
  return (
    <div
      className={"flexbox flexbox-direction-column padding-horizontal-larger"}
    >
      {
        <>
          <StashDate
            fullYear={data.date.fullYear}
            month={data.date.month}
            date={data.date.date}
            day={data.date.day}
          />
          <StashEntries
            hours={data.date.hours}
            minutes={data.date.minutes}
            entries={data.entries}
          />
        </>
      }
    </div>
  );
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

function StashEntries({hours, minutes, entries}) {
  const count = entries.length;
  return (
    <div className={"padding-top-smaller padding-bottom-medium"}>
      <StashCaption hours={hours} minutes={minutes} count={count} />
      {entries.map(({ title, url }) => {
        return <StashEntry title={title} url={url} />;
      })}
      <RestoreButton count={count} />
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
        class="pointer overflow-hidden white-space-nowrap text-ellipsis"
        title={`${title} - ${url}`}
      >
        {title}
      </div>
    </div>
  );
}

function RestoreButton({count}) {
  return (
    <div class="inline-block padding-top-larger padding-bottom-medium">
      <div class="pointer underline font-size-medium font-weight-bold line-height-medium winager-primary">
        Restore all {count} items
      </div>
    </div>
  );
}

const app = document.createElement("div");
app.id = "my-extension-root";
document.body.appendChild(app);
ReactDOM.render(<Content />, app);
