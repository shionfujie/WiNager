/*global chrome*/

export default function StashEntrySource() {
  function addStashEntries(entries) {
    const timestamp = new Date().toISOString();
    chrome.storage.sync.set({ [timestamp]: entries }, () => {
      chrome.storage.sync.get(null, items => {
        console.debug(items);
      });
    });
  }
  function getStashEntries(callback) {
    chrome.storage.sync.get(null, items => {
      console.debug(items);
      callback(
        _groupByDate(
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
  function _groupByDate(data) {
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

  return {addStashEntries, getStashEntries}
}
