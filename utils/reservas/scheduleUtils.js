// utils/reservas/scheduleUtils.js

const DAY_MAP = {
  mon: { num: 1, ical: "MO", label: "MON" },
  tue: { num: 2, ical: "TU", label: "TUE" },
  wed: { num: 3, ical: "WE", label: "WED" },
  thu: { num: 4, ical: "TH", label: "THU" },
  fri: { num: 5, ical: "FR", label: "FRI" },
  sat: { num: 6, ical: "SA", label: "SAT" },
  sun: { num: 7, ical: "SU", label: "SUN" },
};

export function generateGeneralSchedule(general_week) {
  const schedule = [];

  Object.entries(general_week || {}).forEach(([dayKey, cfg]) => {
    if (!cfg?.enabled || !cfg.start || !cfg.end) return;

    const meta = DAY_MAP[dayKey];
    if (!meta) return;

    const duration_minutes = calculateDuration(cfg.start, cfg.end);

    schedule.push({
      id: `${dayKey}-${meta.num}`,
      day_key: dayKey,
      day_num: meta.num,
      day_label: meta.label,
      days: [meta.ical], // ← AHORA LLENO
      start: cfg.start,
      end: cfg.end,
      duration_minutes,
      rrule: `FREQ=WEEKLY;BYDAY=${meta.ical};INTERVAL=1`,
      enabled: true,
    });
  });

  return schedule;
}

export function generateGeneralBreaks(general_breaks_week) {
  console.log("zzz:", general_breaks_week);
  const breaks = [];

  (general_breaks_week || []).forEach((breakItem) => {
    console.log("breakItem..", breakItem, breakItem.day);
    if (
      breakItem &&
      breakItem.start &&
      breakItem.end &&
      breakItem.day &&
      DAY_MAP[breakItem.day]
    ) {
      breaks.push({
        day_key: breakItem.day,
        day_label: DAY_MAP[breakItem.day].label,
        start: breakItem.start,
        end: breakItem.end,
        label: DAY_MAP[breakItem.day].label,
      });
    }
  });

  console.log("breaks[]...", breaks);
  return breaks;
}

function calculateDuration(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

// Bonus: util para frontend también
export function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
