"use client";

import { useMemo, useState } from "react";
import { Card, Pagination } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";

const PAGE_SIZE = 8;
// This is a "recent activity" glance, not a full history browser — capping
// keeps pagination to a handful of pages instead of hundreds against a
// multi-year dataset (entries are already server-sorted newest-first).
const RECENT_LIMIT = 50;
const UNTITLED_WORK_LOG = "(Untitled work log)";

interface RecentActivityTableProps {
  entries: MyTimeEntry[];
  loading: boolean;
}

// Plain semantic table rather than HeroUI's Table compound component — this
// app has no existing Table usage anywhere, and a plain table already
// matches the sr-only accessibility-fallback convention every other chart
// here uses, so this doesn't introduce a second table pattern for one
// widget. No Status column: this app has no approval workflow, and
// fabricating "Approved" on every row would misrepresent real data.
//
// entries/loading come from AnalyticsDashboard's single useMyTimeEntries()
// call — see TicketDurationBoxPlot's comment for why every widget can't
// just fetch its own copy of this all-time dataset.
export function RecentActivityTable({ entries: allEntries, loading }: RecentActivityTableProps) {
  const [page, setPage] = useState(0);

  const entries = useMemo(() => allEntries.slice(0, RECENT_LIMIT), [allEntries]);
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageItems = useMemo(() => entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE), [entries, page]);

  const atOldest = page >= pageCount - 1;
  const atNewest = page <= 0;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Recent activity</h2>
      </div>

      {entries.length === 0 && !loading ? (
        <p className="py-10 text-center text-sm text-foreground/60">No time entries yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default-200 text-left text-xs uppercase tracking-wider text-foreground/50">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Work log</th>
                  <th className="py-2 pr-3 font-medium">Ticket</th>
                  <th className="py-2 text-right font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((entry) => (
                  <tr key={entry.id} className="border-b border-default-100 last:border-0">
                    <td className="py-2 pr-3 text-foreground/70">
                      {new Date(entry.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                    <td className="max-w-[10rem] truncate py-2 pr-3 text-foreground" title={entry.workLogName ?? UNTITLED_WORK_LOG}>
                      {entry.workLogName?.trim() || UNTITLED_WORK_LOG}
                    </td>
                    <td className="py-2 pr-3 text-foreground/70">{entry.ticket ? entry.ticket.ticketNumber : "—"}</td>
                    <td className="py-2 text-right tabular-nums text-foreground">
                      {formatDuration(minutesBetween(entry.startTime, entry.endTime))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination className="mt-3">
            <Pagination.Content className="flex w-full items-center justify-between gap-2 rounded-md bg-surface px-2 py-1.5">
              <Pagination.Item>
                <Pagination.Previous isDisabled={atNewest} onPress={() => setPage((p) => Math.max(0, p - 1))} aria-label="Newer entries">
                  <Pagination.PreviousIcon>
                    <ChevronLeft />
                  </Pagination.PreviousIcon>
                </Pagination.Previous>
              </Pagination.Item>

              <Pagination.Item className="min-w-0 flex-1">
                <Pagination.Summary className="text-center">
                  Page {page + 1} of {pageCount}
                </Pagination.Summary>
              </Pagination.Item>

              <Pagination.Item>
                <Pagination.Next isDisabled={atOldest} onPress={() => setPage((p) => Math.min(pageCount - 1, p + 1))} aria-label="Older entries">
                  <Pagination.NextIcon>
                    <ChevronRight />
                  </Pagination.NextIcon>
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </>
      )}
    </Card>
  );
}

export default RecentActivityTable;
