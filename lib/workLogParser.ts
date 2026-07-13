// Parses the pasted/uploaded work log text format used by the "New Work Log"
// upload flow:
//
//   [08:00 AM - 09:00 AM]
//   + [08:00 AM - 08:30 AM] - (19620) Verified BPMS was picked up in PRODAppX
//   + [08:30 AM - 08:45 AM] - (19620) Emailed user confirmation resolution
//
// An hour block header line is followed by zero or more "+ [start - end] -
// (ticket) description" entry lines. A ticket of "()" means no ticket. Lines
// that don't match either pattern are treated as a continuation of the
// previous entry's description (the source text wraps long notes across
// multiple lines, sometimes with blank separator lines in between).

const BLOCK_HEADER_RE = /^\[\s*(\d{1,2}:\d{2}\s*[AaPp][Mm])\s*-\s*(\d{1,2}:\d{2}\s*[AaPp][Mm])\s*\]$/;
const ENTRY_RE =
  /^\+\s*\[\s*(\d{1,2}:\d{2}\s*[AaPp][Mm])\s*-\s*(\d{1,2}:\d{2}\s*[AaPp][Mm])\s*\]\s*-\s*\(([^)]*)\)\s*(.*)$/;
const TIME_RE = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/;

export interface ParsedTimeEntry {
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
  ticketNumber: number | null;
  description: string;
}

export interface ParsedHourBlock {
  startMinutes: number;
  endMinutes: number;
  startLabel: string;
  endLabel: string;
  entries: ParsedTimeEntry[];
}

export interface ParseIssue {
  line: number;
  message: string;
}

export interface ParseResult {
  blocks: ParsedHourBlock[];
  errors: ParseIssue[];
}

// Standard 12h -> minutes-since-midnight conversion; returns null for text
// that doesn't match "H:MM AM/PM" or has an out-of-range hour/minute.
function parseTimeToMinutes(raw: string): number | null {
  const match = raw.match(TIME_RE);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) return null;

  const isPM = match[3].toUpperCase() === "PM";
  const hour24 = (hour12 % 12) + (isPM ? 12 : 0);
  return hour24 * 60 + minute;
}

export function parseWorkLogText(text: string): ParseResult {
  const lines = text.split(/\r\n|\r|\n/);
  const blocks: ParsedHourBlock[] = [];
  const errors: ParseIssue[] = [];

  let currentBlock: ParsedHourBlock | null = null;
  let currentEntry: ParsedTimeEntry | null = null;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (line.length === 0) return; // blank lines are separators, never appended

    const blockMatch = line.match(BLOCK_HEADER_RE);
    if (blockMatch) {
      const startMinutes = parseTimeToMinutes(blockMatch[1]);
      const endMinutes = parseTimeToMinutes(blockMatch[2]);
      currentEntry = null;

      if (startMinutes == null || endMinutes == null) {
        errors.push({ line: lineNumber, message: `Could not parse hour block "${line}"` });
        currentBlock = null;
        return;
      }
      if (endMinutes <= startMinutes) {
        errors.push({ line: lineNumber, message: `Hour block end time must be after its start time: "${line}"` });
      }

      currentBlock = {
        startMinutes,
        endMinutes,
        startLabel: blockMatch[1].trim(),
        endLabel: blockMatch[2].trim(),
        entries: [],
      };
      blocks.push(currentBlock);
      return;
    }

    const entryMatch = line.match(ENTRY_RE);
    if (entryMatch) {
      if (!currentBlock) {
        errors.push({ line: lineNumber, message: `Entry appears before any hour block header: "${line}"` });
        currentEntry = null;
        return;
      }

      const startMinutes = parseTimeToMinutes(entryMatch[1]);
      const endMinutes = parseTimeToMinutes(entryMatch[2]);
      const ticketRaw = entryMatch[3].trim();
      const description = entryMatch[4].trim();

      if (startMinutes == null || endMinutes == null) {
        errors.push({ line: lineNumber, message: `Could not parse entry time range: "${line}"` });
        currentEntry = null;
        return;
      }

      let ticketNumber: number | null = null;
      if (ticketRaw !== "") {
        const parsedTicket = Number(ticketRaw);
        if (!Number.isInteger(parsedTicket) || parsedTicket <= 0) {
          errors.push({ line: lineNumber, message: `Invalid ticket number "${ticketRaw}": "${line}"` });
        } else {
          ticketNumber = parsedTicket;
        }
      }

      if (endMinutes <= startMinutes) {
        errors.push({ line: lineNumber, message: `Entry end time must be after its start time: "${line}"` });
      } else {
        const duration = endMinutes - startMinutes;
        if (duration < 15 || duration % 15 !== 0) {
          errors.push({ line: lineNumber, message: `Entry duration must be a multiple of 15 minutes: "${line}"` });
        }
      }

      if (startMinutes < currentBlock.startMinutes || endMinutes > currentBlock.endMinutes) {
        errors.push({
          line: lineNumber,
          message: `Entry must fall within its hour block (${currentBlock.startLabel} - ${currentBlock.endLabel}): "${line}"`,
        });
      }

      const previous = currentBlock.entries[currentBlock.entries.length - 1];
      if (previous && startMinutes < previous.endMinutes) {
        errors.push({ line: lineNumber, message: `Entry overlaps with the previous entry: "${line}"` });
      }

      currentEntry = {
        startMinutes,
        endMinutes,
        startLabel: entryMatch[1].trim(),
        endLabel: entryMatch[2].trim(),
        ticketNumber,
        description,
      };
      currentBlock.entries.push(currentEntry);
      return;
    }

    // Neither a block header nor an entry line — a wrapped continuation of
    // the previous entry's description (long notes, stray URLs, etc).
    if (currentEntry) {
      currentEntry.description = currentEntry.description ? `${currentEntry.description}\n${line}` : line;
    } else {
      errors.push({ line: lineNumber, message: `Unrecognized line: "${line}"` });
    }
  });

  return { blocks, errors };
}

export function countEntries(blocks: ParsedHourBlock[]): number {
  return blocks.reduce((sum, block) => sum + block.entries.length, 0);
}
