"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, Button, Card, Label, Dropdown, Pagination } from "@heroui/react";
import { ChevronLeft, ChevronRight, Ellipsis, Pencil } from "@gravity-ui/icons";
import type { Key } from "react-aria-components";
import type { useWorkLogs } from "@/hooks/useWorkLogs";
import type { MyTimeEntry } from "@/hooks/useMyTimeEntries";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { useBorders } from "@/context/BordersContext";
import { minutesBetween, formatDuration } from "@/lib/timeTotals";
import { weekKey, weekLabel, groupByWeek } from "@/lib/weekBuckets";
import { NewWorkLogDialog } from "./NewWorkLogDialog";
import { RenameWorkLogDialog } from "./RenameWorkLogDialog";
import { DeleteWorkLogDialog } from "./DeleteWorkLogDialog";

function formatDate(isoDate: string) {
  return new Date(isoDate).toISOString().split("T")[0]; // yyyy-mm-dd
}

// Accepts useWorkLogs()'s result as props rather than calling the hook
// itself — WorkLogTimeEntryCardLayout (the parent) also needs the selected
// work log's name/date for its header, and useWorkLogs holds its state in a
// plain useState, not a shared context, so two independent calls would each
// have their own copy and go stale relative to each other (e.g. a work log
// created here would never show up in the parent's copy). `entries` is
// similarly the parent's own useMyTimeEntries() call, reused here purely to
// compute per-week hour subtotals (a WorkLog carries no duration itself —
// only its child TimeEntrys do); useMyTimeEntries() is already known-safe to
// call from a second location (OverviewReport.tsx does), unlike useWorkLogs().
type WorkLogListBoxProps = Pick<
  ReturnType<typeof useWorkLogs>,
  "workLogs" | "loading" | "error" | "createWorkLog" | "renameWorkLog" | "deleteWorkLog"
> & {
  entries: MyTimeEntry[];
};

interface WorkLogItem {
  id: string;
  label: string;
  date: string;
  description?: string | null;
}

interface WeekSection {
  key: string;
  start: Date;
  totalMinutes: number;
  logs: WorkLogItem[];
}

export function WorkLogListBox({
  workLogs,
  loading,
  error,
  createWorkLog,
  renameWorkLog,
  deleteWorkLog,
  entries,
}: WorkLogListBoxProps) {
  const { selectedWorkLogId, setSelectedWorkLogId } = useSelectedWorkLog();
  const { bordersEnabled } = useBorders();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const items = useMemo<WorkLogItem[]>(
    () =>
      workLogs.map((log) => ({
        id: log.id,
        label: log.name,
        date: log.workLogDate,
        description: log.description,
      })),
    [workLogs]
  );

  // Per-work-log minute totals, from the parent's already-fetched entries —
  // avoids an N+1 fetch just for a sidebar subtotal.
  const minutesByWorkLog = useMemo(() => {
    const totals = new Map<string, number>();
    for (const entry of entries) {
      if (!entry.workLogId) continue;
      const minutes = minutesBetween(entry.startTime, entry.endTime);
      totals.set(entry.workLogId, (totals.get(entry.workLogId) ?? 0) + minutes);
    }
    return totals;
  }, [entries]);

  // Newest week first — the carousel below steps through this array by
  // index rather than raw date math, so older/newer only ever lands on a
  // week that actually has work logs in it.
  const weekSections = useMemo<WeekSection[]>(() => {
    const grouped = groupByWeek(items, (item) => new Date(item.date));
    return Array.from(grouped.entries())
      .map(([key, logs]) => {
        const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
        const totalMinutes = sortedLogs.reduce((sum, log) => sum + (minutesByWorkLog.get(log.id) ?? 0), 0);
        return { key, start: new Date(key), totalMinutes, logs: sortedLogs };
      })
      .sort((a, b) => b.key.localeCompare(a.key)); // newest week first
  }, [items, minutesByWorkLog]);

  const [weekIndex, setWeekIndex] = useState(0);

  // Keep the index in range as the underlying week list changes (e.g. the
  // very first work log ever created, or one deleted out from under the
  // currently-viewed week).
  useEffect(() => {
    if (weekIndex > 0 && weekIndex >= weekSections.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeekIndex(Math.max(0, weekSections.length - 1));
    }
  }, [weekSections.length, weekIndex]);

  // If the selected work log isn't in the week currently shown (e.g. a
  // search jump, or a selection restored from a prior session), jump the
  // carousel to its week — same idea as the hour-block auto-expand in
  // WorkLogTimeEntryCardLayout, one level up. Deliberately keyed off
  // `selectedWorkLogId` alone (not `weekIndex`): including `weekIndex` here
  // made this effect re-fire on every manual carousel click and immediately
  // snap back to the selected item's week, making the arrows look broken.
  useEffect(() => {
    if (!selectedWorkLogId) return;
    const selected = items.find((item) => item.id === selectedWorkLogId);
    if (!selected) return;
    const key = weekKey(new Date(selected.date));
    const index = weekSections.findIndex((week) => week.key === key);
    if (index === -1) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeekIndex((current) => (current === index ? current : index));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkLogId]);

  const currentWeek = weekSections[weekIndex] ?? null;
  // "Older" (left/Previous) steps toward the start of the array (higher
  // index, further back in time); "newer" (right/Next) steps toward the
  // present (lower index) — index 0 is always the most recent week.
  const atOldest = weekSections.length === 0 || weekIndex >= weekSections.length - 1;
  const atNewest = weekIndex <= 0;
  const goOlder = () => setWeekIndex((i) => Math.min(weekSections.length - 1, i + 1));
  const goNewer = () => setWeekIndex((i) => Math.max(0, i - 1));

  const weekItems = useMemo(
    () =>
      (currentWeek?.logs ?? []).map((log) => ({
        id: log.id,
        label: log.label,
        date: log.date,
        description: log.description,
      })),
    [currentWeek]
  );

  const selectedItem = items.find((item) => item.id === selectedWorkLogId) ?? null;

  const handleSelectionChange = (key: Key) => {
    setSelectedWorkLogId(key != null ? String(key) : null);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading work logs...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-3">
      <div className="min-h-0 flex-1">
        {weekSections.length === 0 ? (
          <p className="p-4 text-sm text-foreground/60">No work logs yet.</p>
        ) : weekItems.length === 0 ? (
          <p className="p-4 text-sm text-foreground/60">No work logs this week.</p>
        ) : (
          <Tabs
            orientation="vertical"
            className="h-full w-full min-h-0"
            selectedKey={selectedWorkLogId ?? undefined}
            onSelectionChange={handleSelectionChange}
          >
            <Tabs.ListContainer className="h-full w-full min-w-0">
              <Tabs.List
                aria-label="Work Logs"
                className={`h-full w-full min-w-0 overflow-hidden bg-surface ${bordersEnabled ? "border border-default-200" : ""
                  }`}
                data-glass="surface"
              >
                {weekItems.map((item) => (
                  <Tabs.Tab
                    key={item.id}
                    id={item.id}
                    // No Tabs.Indicator: react-aria's FLIP-animated overlay
                    // was measuring/sizing itself independently of the tab
                    // (rendering as a small mis-sized blob at the left edge
                    // instead of spanning the tab) — painting the selected
                    // fill directly on the tab itself guarantees it's always
                    // sized exactly to the tab's own box.
                    className="h-auto w-full min-w-0 justify-start border-l-2 border-transparent px-3 py-2 text-left text-foreground/60 data-[selected=true]:border-accent data-[selected=true]:bg-accent-soft data-[selected=true]:text-foreground"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Label className="truncate font-medium">{item.label}</Label>
                      <span className="truncate text-sm text-gray-500">{formatDate(item.date)}</span>
                    </div>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>

            {weekItems.map((item) => (
              <Tabs.Panel key={item.id} id={item.id} className="hidden">
                {null}
              </Tabs.Panel>
            ))}
          </Tabs>
        )}
      </div>

      <Card className="flex shrink-0 flex-col gap-3 p-3">
        {weekSections.length > 0 && (
          <Pagination size="sm">
            {/* No bg-surface: the parent Card above already provides it (and
                stays translucent under the card opacity/blur settings). */}
            <Pagination.Content className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5">
              <Pagination.Item>
                <Pagination.Previous isDisabled={atOldest} onPress={goOlder} aria-label="Older week">
                  <Pagination.PreviousIcon>
                    <ChevronLeft className="size-4" />
                  </Pagination.PreviousIcon>
                </Pagination.Previous>
              </Pagination.Item>

              <Pagination.Item className="min-w-0 flex-1">
                <Pagination.Summary className="text-center">
                  <div className="truncate text-sm font-medium">{currentWeek ? weekLabel(currentWeek.start) : ""}</div>
                  <div className="text-xs tabular-nums text-foreground/50">
                    {currentWeek ? formatDuration(currentWeek.totalMinutes) : ""}
                  </div>
                </Pagination.Summary>
              </Pagination.Item>

              <Pagination.Item>
                <Pagination.Next isDisabled={atNewest} onPress={goNewer} aria-label="Newer week">
                  <Pagination.NextIcon>
                    <ChevronRight className="size-4" />
                  </Pagination.NextIcon>
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        )}

        <div className="flex gap-2">
          <Button aria-label="New work log" onPress={() => setIsDialogOpen(true)}>
            +
          </Button>

          <Button
            aria-label="Rename work log"
            isDisabled={!selectedItem}
            onPress={() => setIsRenameDialogOpen(true)}
          >
            <Pencil width={16} height={16} />
          </Button>

          <Dropdown>
            <Dropdown.Trigger aria-label="Work log actions" isDisabled={!selectedItem}>
              <Ellipsis width={16} height={16} />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === "delete") setIsDeleteDialogOpen(true);
                }}
              >
                <Dropdown.Item id="delete">Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </Card>

      <NewWorkLogDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={async (data) => {
          const { workLogId } = await createWorkLog(data);
          setSelectedWorkLogId(workLogId);
        }}
      />

      {selectedItem && (
        <RenameWorkLogDialog
          isOpen={isRenameDialogOpen}
          initialName={selectedItem.label}
          onClose={() => setIsRenameDialogOpen(false)}
          onRename={(name) => renameWorkLog(selectedItem.id, name)}
        />
      )}

      {selectedItem && (
        <DeleteWorkLogDialog
          isOpen={isDeleteDialogOpen}
          workLogName={selectedItem.label}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={async () => {
            await deleteWorkLog(selectedItem.id);
            setSelectedWorkLogId(null);
          }}
        />
      )}
    </div>
  );
}

export default WorkLogListBox;
