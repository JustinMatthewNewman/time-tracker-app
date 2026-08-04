"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRightFromSquare } from "@gravity-ui/icons";
import { useUpdateTimeEntry } from "@/src/dataconnect-generated/react";
import type { UpdateTimeEntryVariables } from "@/src/dataconnect-generated";
import type { TicketTimeEntry } from "@/hooks/useTimeEntriesByTicket";

interface TicketDayEntriesTableProps {
  entries: TicketTimeEntry[];
  // Every entry rendered here already belongs to this ticket (the page's own
  // ticket) — unlike WorkLogTimeEntryCardTable, there's no per-row ticket to
  // read/clear, so UpdateTimeEntry's required ticketNumber is just this one.
  ticketNumber: number;
  onEntryUpdated?: () => void;
  onViewWorkLog: (entry: TicketTimeEntry) => void;
}

type Drafts = Record<string, string>; // entryId -> description draft

const AUTOSAVE_DELAY_MS = 600;

function formatTime(isoDate: string) {
  return new Date(isoDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function TicketDayEntriesTable({
  entries,
  ticketNumber,
  onEntryUpdated,
  onViewWorkLog,
}: TicketDayEntriesTableProps) {
  const updateMutation = useUpdateTimeEntry();
  const [drafts, setDrafts] = useState<Drafts>({});

  // Same mirrors-kept-in-sync-via-effects pattern as WorkLogTimeEntryCardTable,
  // so the debounce timers/unmount flush always see the latest values instead
  // of whatever was captured in the closure from the render that scheduled them.
  const draftsRef = useRef(drafts);
  const entriesRef = useRef(entries);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const saveDescriptionRef = useRef<(entryId: string) => void>(() => {});

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  useEffect(() => {
    saveDescriptionRef.current = (entryId: string) => {
      const description = draftsRef.current[entryId];
      const entry = entriesRef.current.find((e) => e.id === entryId);
      if (description === undefined || !entry) return;

      updateMutation
        .mutateAsync({ entryId, description, ticketNumber } as UpdateTimeEntryVariables)
        .then(() => onEntryUpdated?.())
        .catch((err) => console.error("Failed to save time entry", err));
    };
  });

  const getDescription = (entry: TicketTimeEntry) => drafts[entry.id] ?? entry.description ?? "";

  const setDescriptionDraft = (entryId: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [entryId]: value }));

    clearTimeout(timersRef.current[entryId]);
    timersRef.current[entryId] = setTimeout(() => saveDescriptionRef.current(entryId), AUTOSAVE_DELAY_MS);
  };

  // Flush any pending edits immediately so collapsing this day (which unmounts
  // this table) never silently drops an in-progress edit before the debounce fires.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.keys(timers).forEach((entryId) => {
        clearTimeout(timers[entryId]);
        saveDescriptionRef.current(entryId);
      });
    };
  }, []);

  if (entries.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No time entries for this day.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="w-40 border p-2 text-left">Time</th>
            <th className="w-56 border p-2 text-left">Work Log</th>
            <th className="border p-2 text-left">Description</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="border p-2 whitespace-nowrap">
                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
              </td>

              <td className="border p-2">
                <div className="flex items-center gap-2">
                  <span className="truncate">{entry.workLog?.name ?? "—"}</span>
                  {entry.workLog && (
                    <button
                      type="button"
                      aria-label={`View entry in ${entry.workLog.name}`}
                      onClick={() => onViewWorkLog(entry)}
                      className="shrink-0 rounded p-1 text-foreground/40 hover:bg-default hover:text-foreground"
                    >
                      <ArrowUpRightFromSquare className="size-3.5" />
                    </button>
                  )}
                </div>
              </td>

              <td className="border p-2">
                <textarea
                  className="w-full rounded border p-2"
                  rows={2}
                  value={getDescription(entry)}
                  onChange={(e) => setDescriptionDraft(entry.id, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketDayEntriesTable;
