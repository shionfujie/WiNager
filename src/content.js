import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
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
  return <StashModal isOpen={stashModalIsOpen} onRequestClose={closeStashModal}/>;
}

function StashModal({isOpen, onRequestClose}) {
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
    <ReactModal isOpen={isOpen} onRequestClose={onRequestClose} style={style}>
      <StashList />
    </ReactModal>
  );
}

function StashList() {
  const data = [
    {
      date: {
        fullYear: 2020,
        month: 6,
        date: 31,
        day: 4,
        hours: 22,
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
    },
    {
      date: {
        fullYear: 2020,
        month: 6,
        date: 31,
        day: 4,
        hours: 21,
        minutes: 55
      },
      entries: [
        {
          title: "e (mathematical constant) - Wikipedia",
          url: "https://en.wikipedia.org/wiki/E_(mathematical_constant)#Alternative_characterizations"
        },
        {
          title:
            "データで学ぶ - 各国比較",
          url:
            "https://www.covid19-yamanaka.com/cont3/17.html"
        },
        {
          title:
            "(2) YouTube",
          url:
            "https://www.youtube.com/"
        },
        {
          title:
            "ShionFujie (Shion T. Fujie)",
          url:
            "https://github.com/ShionFujie"
        },
        {
          title:
            "国立公園のワーケーションなどに補助金 雇用維持へ 環境省 | NHKニュース",
          url:
            "https://www3.nhk.or.jp/news/html/20200724/k10012530791000.html"
        }
      ]
    },
    {
      date: {
        fullYear: 2020,
        month: 6,
        date: 30,
        day: 3,
        hours: 10,
        minutes: 15
      },
      entries: [
        {
          title: "オリンピアン・パラリンピアンによるオンライン体験",
          url: "https://www.airbnb.jp/s/experiences/olympics-online"
        },
        {
          title: "Binomial coefficient - Wikipedia",
          url: "https://en.wikipedia.org/wiki/Binomial_coefficient#Identities_involving_binomial_coefficients"
        },
        {
          title: "Wolfram|Alpha Examples: Combinatorics",
          url: "Wolfram|Alpha Examples: Combinatorics - https://www.wolframalpha.com/examples/mathematics/discrete-mathematics/combinatorics/"
        },
        {
          title: "東洋経済オンライン | 経済ニュースの新基準",
          url: "https://toyokeizai.net/"
        },
        {
          title: "四川省 - Wikipedia",
          url: "https://ja.wikipedia.org/wiki/%E5%9B%9B%E5%B7%9D%E7%9C%81"
        },
        {
          title: "Google Translate",
          url: "https://translate.google.com/?hl=en&tab=TT&authuser=0#view=home&op=translate&sl=en&tl=ja"
        }
      ]
    }
  ]
  function groupByDate(data) {
    return data.reduce((acc, {date: {fullYear, month, date, day, ...time}, entries}) => {
      const last = acc[acc.length - 1]
      if (last && last.date.fullYear === fullYear && last.date.month === month && last.date.date === date) 
        last.entries.push({ time, entries })
      else 
        acc.push({
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
      {groupByDate(data).map(({date, entries}) => 
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
                hours={time.hours}
                minutes={time.minutes}
                entries={entries}
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
