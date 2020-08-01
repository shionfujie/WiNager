export default function hasSameDate(date, date1) {
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function get(obj, attr) {
    const getFun = obj[`get${capitalize(attr)}`];
    if (typeof getFun === "function") return getFun.call(obj);
    else return obj[attr];
  }
  return (
    get(date, "fullYear") === get(date1, "fullYear") &&
    get(date, "month") === get(date1, "month") &&
    get(date, "date") === get(date1, "date")
  );
}
