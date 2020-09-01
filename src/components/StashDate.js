import React from "react";
import hasSameDate from "../util/dates/hasSameDate";

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

export default function StashDate({ fullYear, month, date, day }) {
  function displayDate(fullYear, month, date, day) {
    const today = new Date();
    const thatDate = { fullYear, month, date };
    const commonPart = `${daysOfWeek[day]}, ${months[month]} ${date}`;
    if (hasSameDate(thatDate, today)) return `Today - ${commonPart}`;
    today.setDate(today.getDate() - 1);
    if (hasSameDate(thatDate, today)) return `Yesterday - ${commonPart}`;
    if (fullYear == today.getFullYear()) return `${commonPart}`;
    else return `${commonPart}, ${fullYear}`;
  }
  return (
    <div className="flexbox flexbox-justify-center">
      <div className="shade-087 font-size-huge font-weight-bold line-height-huge padding-top-extra-large">
        {displayDate(fullYear, month, date, day)}
      </div>
    </div>
  );
}
