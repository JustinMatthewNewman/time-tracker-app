// Monday-start week bucketing for grouping WorkLogs/TimeEntries into weekly
// sections (dashboard trend chart, worklogs sidebar). Local-midnight `Date`
// construction throughout — never `new Date("yyyy-mm-dd")`, which parses as
// UTC and shifts week boundaries by the local offset (same fix documented in
// scripts/seed-stress-test.mjs's localMidnight() and NewWorkLogDialog.tsx).

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function localMidnight(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

export function startOfWeek(date: Date): Date {
  const d = localMidnight(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  return localMidnight(start.getFullYear(), start.getMonth(), start.getDate() + 6);
}

// Stable sortable/groupable key: the week's Monday as "yyyy-mm-dd".
export function weekKey(date: Date): string {
  const start = startOfWeek(date);
  const y = start.getFullYear();
  const m = String(start.getMonth() + 1).padStart(2, "0");
  const d = String(start.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "Jul 20 – Jul 26, 2026" (handles a week crossing a month/year boundary).
export function weekLabel(weekStart: Date): string {
  const end = localMidnight(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const startMonth = MONTH_NAMES[weekStart.getMonth()];
  const endMonth = MONTH_NAMES[end.getMonth()];
  const startStr = `${startMonth} ${weekStart.getDate()}`;
  const endStr = `${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

export function getRelativeWeekLabel(weekStart: Date, relativeTo: Date = new Date()): string {
  const currentWeekStart = startOfWeek(relativeTo);
  const targetWeekStart = startOfWeek(weekStart);

  const diffMs = currentWeekStart.getTime() - targetWeekStart.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.round(diffDays / 7);

  if (diffWeeks === 0) return "This week";
  if (diffWeeks === 1) return "Last week";
  if (diffWeeks < 0) {
    if (diffWeeks === -1) return "Next week";
    return `In ${Math.abs(diffWeeks)} weeks`;
  }

  const currentYear = currentWeekStart.getFullYear();
  const currentMonth = currentWeekStart.getMonth();
  const targetYear = targetWeekStart.getFullYear();
  const targetMonth = targetWeekStart.getMonth();

  const monthDiff = (currentYear - targetYear) * 12 + (currentMonth - targetMonth);
  const yearDiff = currentYear - targetYear;

  if (yearDiff >= 2) {
    return `${yearDiff} Years Ago`;
  }
  if (yearDiff === 1 && monthDiff >= 12) {
    return "Last Year";
  }
  if (monthDiff > 1 && yearDiff < 2) {
    return `${monthDiff} Months Ago`;
  }
  if (monthDiff === 1 && diffWeeks >= 3) {
    return "Last Month";
  }
  if (diffWeeks < 4 && monthDiff <= 1) {
    return `${diffWeeks} weeks ago`;
  }
  if (monthDiff === 1) {
    return "Last Month";
  }

  return `${diffWeeks} weeks ago`;
}

export function isSameWeek(a: Date, b: Date): boolean {
  return weekKey(a) === weekKey(b);
}

export function groupByWeek<T>(items: T[], getDate: (item: T) => Date): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = weekKey(getDate(item));
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}
