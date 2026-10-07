"use client";

import { useState } from "react";
import { Card, Button } from "@heroui/react";
import { formatDuration } from "@/lib/timeTotals";

interface DuplicateWorkLogDialogProps {
  isOpen: boolean;
  sourceName: string;
  /** yyyy-mm-dd of the work log being copied, for the "copying from" line. */
  sourceDate: string;
  entryCount: number;
  totalMinutes: number;
  onClose: () => void;
  onDuplicate: (data: { name: string; date: string }) => Promise<void>;
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Copy a work log — its entries included — onto another date.
 *
 * Asks for a date rather than silently copying onto the source's own day: the
 * reason to duplicate a day of work is almost always "today looked like
 * yesterday", and two work logs on one date is the one case the rest of the app
 * handles ambiguously (the calendar picks the earliest-created one for its
 * click target).
 */
export function DuplicateWorkLogDialog({
  isOpen,
  sourceName,
  sourceDate,
  entryCount,
  totalMinutes,
  onClose,
  onDuplicate,
}: DuplicateWorkLogDialogProps) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayDateString);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on the closed -> open transition rather than in an effect, matching
  // RenameWorkLogDialog (https://react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(`${sourceName} (copy)`);
      setDate(todayDateString());
      setError(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onDuplicate({ name: name.trim(), date });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate work log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Duplicate Work Log</h2>

          <p className="text-sm text-foreground/60">
            Copying <span className="font-semibold text-foreground">{sourceName}</span> ({sourceDate}) —{" "}
            {entryCount} {entryCount === 1 ? "entry" : "entries"}, {formatDuration(totalMinutes)}. Each
            entry keeps the time of day it had on the original.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="duplicate-worklog-name">
                Title *
              </label>
              <input
                id="duplicate-worklog-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-default-200 px-3 py-2"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="duplicate-worklog-date">
                Date *
              </label>
              <input
                id="duplicate-worklog-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-default-200 px-3 py-2"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isDisabled={loading || !name.trim() || !date}>
                {loading ? "Duplicating..." : "Duplicate"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default DuplicateWorkLogDialog;
