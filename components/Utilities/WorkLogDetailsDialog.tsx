"use client";

import { Card, Button } from "@heroui/react";
import { formatDuration, formatDecimalHours } from "@/lib/timeTotals";

interface WorkLogDetailsDialogProps {
  isOpen: boolean;
  name: string;
  /** yyyy-mm-dd. */
  date: string;
  description?: string | null;
  entryCount: number;
  totalMinutes: number;
  ticketCount: number;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-default-200 py-2 last:border-b-0">
      <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-foreground">{value}</dd>
    </div>
  );
}

/**
 * Read-only summary of a work log.
 *
 * The numbers here (entries, total, distinct tickets) are the ones the sidebar
 * can only show for a whole *week*, since a row there is one line tall. This is
 * where you look when you want them for one day without opening it.
 */
export function WorkLogDetailsDialog({
  isOpen,
  name,
  date,
  description,
  entryCount,
  totalMinutes,
  ticketCount,
  onClose,
}: WorkLogDetailsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="mb-1 text-2xl font-bold">{name}</h2>
          <p className="mb-4 text-sm text-foreground/60">{date}</p>

          <dl className="flex flex-col">
            <Row label="Entries" value={entryCount} />
            <Row
              label="Total time"
              value={
                <>
                  {formatDuration(totalMinutes)}{" "}
                  <span className="text-foreground/50 tabular-nums">
                    ({formatDecimalHours(totalMinutes)}h)
                  </span>
                </>
              }
            />
            <Row label="Tickets" value={ticketCount} />
            <Row
              label="Description"
              value={
                description ? (
                  // Wraps, unlike everywhere else a description is shown: this
                  // dialog exists to show the whole thing, so it is the one
                  // place truncating it would defeat the point.
                  <span className="whitespace-pre-wrap">{description}</span>
                ) : (
                  <span className="italic text-foreground/40">None</span>
                )
              }
            />
          </dl>

          <div className="pt-6">
            <Button type="button" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default WorkLogDetailsDialog;
