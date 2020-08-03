import React from 'react'
import StashCaption from "./StashCaption"
import StashEntry from "./StashEntry"
import RestoreButton from "./RestoreButton"

export default function StashEntries({ stashKey, hours, minutes, entries, onRequestRestore }) {
  const count = entries.length;
  return (
    <div className={"padding-top-smaller padding-bottom-medium"}>
      <StashCaption hours={hours} minutes={minutes} count={count} />
      {entries.map(({ title, url }, idx) => {
        console.debug("[%s] %s", `${stashKey}-${idx}`, title);
        return (
          <StashEntry key={`${stashKey}-${idx}`} title={title} url={url} />
        );
      })}
      <RestoreButton
        onClick={() => onRequestRestore(stashKey)}
        count={count}
      />
    </div>
  );
}
