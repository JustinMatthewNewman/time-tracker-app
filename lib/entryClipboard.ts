import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";

// Zero-padded "hh:mm AM/PM", distinct from TimeRangeSettings' formatHour
// (which drops the leading zero) to match the copy-to-clipboard format below.
export function formatClipboardHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(display).padStart(2, "0")}:00 ${suffix}`;
}

export function formatClipboardTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hours24 = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours24 < 12 ? "AM" : "PM";
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

// A single entry's line, shared by the per-hour copy button (one block per
// entry) and each row's own copy button (this exact block, standalone).
// Newline before AND after the description (even when it's empty) so the
// description always sits on its own line, blank-line-separated from
// whatever follows.
export function formatEntryClipboardLine(entry: WorkLogTimeEntry): string {
  const range = `[${formatClipboardTime(entry.startTime)} - ${formatClipboardTime(entry.endTime)}]`;
  const ticket = entry.ticket ? `(${entry.ticket.ticketNumber})` : "(No ticket)";
  const prefix = `+ ${range} - ${ticket}`;
  const description = entry.description?.trim() ?? "";
  return `${prefix}\n${description}\n`;
}

export function buildHourClipboardText(hour: number, hourEntries: WorkLogTimeEntry[]): string {
  const header = `[${formatClipboardHour(hour)} - ${formatClipboardHour(hour + 1)}]`;
  const lines = hourEntries.map(formatEntryClipboardLine);
  return [header, ...lines].join("\n");
}
