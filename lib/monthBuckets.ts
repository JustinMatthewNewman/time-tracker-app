// Month bucketing for the Calendar report — mirrors lib/weekBuckets.ts'
// Monday-start convention and its local-midnight `Date` construction (never
// `new Date("yyyy-mm-dd")`, which parses as UTC and can shift a day).

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function localMidnight(year: number, month: number, day: number): Date {
  return new Date(year, month, day);
}

export function startOfMonth(date: Date): Date {
  return localMidnight(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  // Day 0 of next month == last day of this month.
  return localMidnight(date.getFullYear(), date.getMonth() + 1, 0);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isSameMonth(a: Date, b: Date): boolean {
  return monthKey(a) === monthKey(b);
}

export function monthLabel(monthStart: Date): string {
  return `${MONTH_NAMES[monthStart.getMonth()]} ${monthStart.getFullYear()}`;
}

export interface MonthGridDay {
  date: Date;
  dayKey: string; // yyyy-mm-dd
  isCurrentMonth: boolean;
}

function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Full 7-wide grid for the given month, Monday-first, padded with the
// trailing days of the previous month and leading days of the next month so
// every row is a complete week (matches how most calendar UIs render).
export function buildMonthGrid(monthStart: Date): MonthGridDay[] {
  const firstOfMonth = startOfMonth(monthStart);
  const lastOfMonth = endOfMonth(monthStart);

  const firstWeekday = firstOfMonth.getDay(); // 0=Sun..6=Sat
  const leadingDays = firstWeekday === 0 ? 6 : firstWeekday - 1; // days before Monday

  const gridStart = localMidnight(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - leadingDays);

  const lastWeekday = lastOfMonth.getDay();
  const trailingDays = lastWeekday === 0 ? 0 : 7 - lastWeekday;
  const gridEnd = localMidnight(lastOfMonth.getFullYear(), lastOfMonth.getMonth(), lastOfMonth.getDate() + trailingDays);

  const days: MonthGridDay[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push({ date: new Date(cursor), dayKey: toDayKey(cursor), isCurrentMonth: isSameMonth(cursor, firstOfMonth) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
