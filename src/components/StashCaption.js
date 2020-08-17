import React from 'react'

export default function StashCaption({ hours, minutes, count }) {
  function displayTime(hours, minutes) {
    const q = Math.floor(hours / 12);
    const r = hours % 12;
    const mm = `${minutes}`.padStart(2, "0");
    if (q < 1) return `${hours}:${mm} AM`;
    else if (r == 0) return `12:${mm} PM`;
    else return `${r}:${mm} PM`;
  }
  return (
    <div className="padding-vertical-medium">
      <div className="shade-087 font-size-larger font-weight-bold line-height-medium">
        {displayTime(hours, minutes)}
      </div>
      <div className="shade-056 font-size-small font-weight-medium line-height-medium">
        {count} items
      </div>
    </div>
  );
}
