import React from 'react';
import Separator from "./Separator";
import StashDate from "./StashDate";
import StashEntries from "./StashEntries";

export default function StashList({ data, chromePort }) {
  return (
    <div
      className={"flexbox flexbox-direction-column padding-horizontal-larger"}
    >
      {data.map(({ date: { fullYear, month, date, day }, entries }) => (
        <>
          <StashDate
            key={`${fullYear}-${month}-${date}`}
            fullYear={fullYear}
            month={month}
            date={date}
            day={day}
          />
          {entries.map(({ stashKey, time, entries }) => (
            <>
              <StashEntries
                key={stashKey}
                stashKey={stashKey}
                hours={time.hours}
                minutes={time.minutes}
                entries={entries}
                chromePort={chromePort}
              />
              <Separator key={`${stashKey}-Separator`} />
            </>
          ))}
        </>
      ))}
    </div>
  );
}
