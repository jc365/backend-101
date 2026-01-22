// utils/rruleFactory.js
export function humanToRRule({ days, start, end }) {
  const sh = +start.slice(0, 2);
  const eh = +end.slice(0, 2);
  const hours = [];
  for (let h = sh; h < eh; h++) {
    hours.push(h.toString().padStart(2, "0"));
  }
  return `FREQ=WEEKLY;BYDAY=${days.join(",")};BYHOUR=${hours.join(",")}`;
}

export function isHoliday(exclusions, dateStr) {
  return exclusions.some(
    (holiday) =>
      holiday.date === dateStr /* check rrule */ ||
      holiday.rrule.includes(dateStr)
  );
}

export function getDayOfWeek(dateStr) {
  // "2026-02-02" → "MO"
  const date = new Date(dateStr + "T00:00:00");
  return ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][date.getDay()];
}
