"use client";

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Accordion, Card, ToggleButton, ToggleButtonGroup } from '@heroui/react'
import { Bars, ChevronDown, FileText, Copy, CopyCheck } from '@gravity-ui/icons'
import ListBoxComponent from '../Utilities/ListBoxComponent'
import { useTimeRange } from '../../context/TimeRangeContext'
import { formatHour } from '../TimeRangeSettings'
import { useSidebar } from "../../context/SideBarContext";
import { useBorders } from "@/context/BordersContext";
import { useSelectedWorkLog } from "../../context/SelectedWorkLogContext";
import { useTimeEntriesByWorkLog, type WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";
import { useWorkLogs } from "@/hooks/useWorkLogs";
import { useMyTimeEntries } from "@/hooks/useMyTimeEntries";
import { buildHourClipboardText } from "@/lib/entryClipboard";
import { WorkLogTimeEntryCardTable } from './WorkLogTimeEntryCardTable';
import TicketBreakdown from './TicketBreakdown';

interface WorkLogTimeEntryCardLayoutProps {
  showBreakdown?: boolean;
  onToggleBreakdown?: (showBreakdown: boolean) => void;
}

function formatWorkLogDate(isoDate: string) {
  return new Date(isoDate).toISOString().split("T")[0]; // yyyy-mm-dd
}

function WorkLogTimeEntryCardLayout({ showBreakdown = false, onToggleBreakdown }: WorkLogTimeEntryCardLayoutProps) {
  const { timeSlots } = useTimeRange()
  const { isOpen, toggle: toggleSidebar } = useSidebar();
  const { bordersEnabled } = useBorders();
  const { selectedWorkLogId, focusEntryId, setFocusEntryId } = useSelectedWorkLog();
  const { entries, loading, error, refetch } = useTimeEntriesByWorkLog(selectedWorkLogId);
  const { workLogs, loading: workLogsLoading, error: workLogsError, createWorkLog, renameWorkLog, deleteWorkLog } = useWorkLogs();
  const { entries: allEntries } = useMyTimeEntries();
  const selectedWorkLog = workLogs.find((log) => log.id === selectedWorkLogId) ?? null;

  const [copiedHour, setCopiedHour] = useState<number | null>(null);

  // Which hour blocks are expanded — lifted out of the Accordion so a search
  // result (see GlobalSearch/SelectedWorkLogContext.focusEntryId) can force
  // the entry's hour open instead of leaving the user to find it themselves.
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Genuinely effectful (not derivable during render): entries arrive
  // asynchronously from a separate fetch, and this also schedules a timer.
  useEffect(() => {
    if (!focusEntryId) return;
    const target = entries.find((entry) => entry.id === focusEntryId);
    if (!target) return; // not in this work log, or still loading

    // Replaces rather than adds to the existing set — the Accordion defaults
    // to single-expand (allowsMultipleExpanded isn't set), so a search jump
    // should honor that and swap to the target hour rather than stacking it
    // on top of whatever else happened to be open.
    const hourKey = String(new Date(target.startTime).getHours());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedKeys((prev) => (prev.size === 1 && prev.has(hourKey) ? prev : new Set([hourKey])));

    // One-shot: clear it so re-expanding/collapsing the same hour later
    // doesn't keep snapping back open.
    const timeout = setTimeout(() => setFocusEntryId(null), 2000);
    return () => clearTimeout(timeout);
  }, [focusEntryId, entries, setFocusEntryId]);

  const handleCopyHour = async (hour: number, hourEntries: WorkLogTimeEntry[]) => {
    try {
      await navigator.clipboard.writeText(buildHourClipboardText(hour, hourEntries));
      setCopiedHour(hour);
      setTimeout(() => setCopiedHour((current) => (current === hour ? null : current)), 1500);
    } catch (err) {
      console.error("Failed to copy hour summary", err);
    }
  };

  // Grouped once per entries change (O(n)) instead of re-filtering the full
  // entries array once per hour on every render (O(hours × entries)).
  const entriesByHour = useMemo(() => {
    const map = new Map<number, WorkLogTimeEntry[]>();
    for (const entry of entries) {
      const hour = new Date(entry.startTime).getHours();
      const bucket = map.get(hour);
      if (bucket) bucket.push(entry);
      else map.set(hour, [entry]);
    }
    return map;
  }, [entries]);

  const handleEntryUpdated = useCallback(() => refetch(), [refetch]);

  // Drives the header's ToggleButtonGroup — sidebar-open and show-breakdown
  // are independent booleans, not mutually exclusive options, hence multiple
  // selection rather than single.
  const viewControlKeys = useMemo(() => {
    const keys: string[] = [];
    if (isOpen) keys.push("sidebar");
    if (showBreakdown) keys.push("breakdown");
    return keys;
  }, [isOpen, showBreakdown]);

  return (
    <div className='flex h-full items-stretch overflow-hidden'>
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 overflow-hidden
          ${isOpen ? "w-88" : "w-0"}
        `}
      >
        <div className="w-88 h-full bg-default-50 p-4">
          <ListBoxComponent
            workLogs={workLogs}
            loading={workLogsLoading}
            error={workLogsError}
            createWorkLog={createWorkLog}
            renameWorkLog={renameWorkLog}
            deleteWorkLog={deleteWorkLog}
            entries={allEntries}
          />
        </div>
      </aside>

      <div
        className={`flex h-full min-w-0 flex-1 min-h-0 flex-col text-foreground p-4 border-l transition-colors duration-300
          ${isOpen && bordersEnabled ? "border-default-200" : "border-transparent"}`}
      >
        {!selectedWorkLogId && (
          <div className="text-sm text-gray-500 p-4">
            Select a work log from the sidebar to view its time entries.
          </div>
        )}

        {selectedWorkLogId && error && (
          <div className="text-sm text-red-500 p-4">Error: {error}</div>
        )}

        {selectedWorkLogId && !error && selectedWorkLog && (
          <div className='grid h-full min-h-0 grid-cols-1 lg:grid-cols-1 gap-4'>
            <Card className="flex h-full min-h-0 flex-col overflow-hidden border border-default-200">
              {/* Sticky header: stays fixed while the entries/breakdown body below scrolls.
                  No background of its own — inherits the parent Card's (translucent when
                  Settings' card opacity/blur are dialed down) rather than re-opaquing itself. */}
              <div
                className={`sticky top-0 z-10 flex shrink-0 items-center gap-3 p-3 ${
                  bordersEnabled ? "border-b border-default-200" : ""
                }`}
              >
                <ToggleButtonGroup
                  aria-label="Worklog view controls"
                  selectionMode="multiple"
                  selectedKeys={viewControlKeys}
                  onSelectionChange={(keys) => {
                    const nextSidebarOpen = keys.has("sidebar");
                    if (nextSidebarOpen !== isOpen) toggleSidebar();
                    onToggleBreakdown?.(keys.has("breakdown"));
                  }}
                >
                  <ToggleButton id="sidebar" isIconOnly variant="ghost" aria-label="Toggle sidebar">
                    <Bars className="size-4" aria-hidden />
                  </ToggleButton>
                  <ToggleButton id="breakdown" isIconOnly variant="ghost" aria-label="Show ticket breakdown">
                    <FileText className="size-4" aria-hidden />
                  </ToggleButton>
                </ToggleButtonGroup>
                <span className="font-medium text-foreground">{selectedWorkLog.name}</span>
                <span className="text-sm text-gray-500">{formatWorkLogDate(selectedWorkLog.workLogDate)}</span>
              </div>

              {/*
                Both views stay mounted at all times and are only hidden via CSS.
                Unmounting WorkLogTimeEntryCardTable on toggle would discard any in-progress
                edit sitting in its local draft state before the autosave debounce fires.
              */}
              <div className={`flex-1 min-h-0 ${showBreakdown ? "hidden" : "overflow-y-auto"}`}>
                <Accordion
                  className="w-full"
                  expandedKeys={expandedKeys}
                  onExpandedChange={(keys) => setExpandedKeys(new Set(Array.from(keys, String)))}
                >
                  {timeSlots.map((hour) => {
                    const hourEntries = entriesByHour.get(hour) ?? [];
                    const isExpanded = expandedKeys.has(String(hour));

                    return (
                      <Accordion.Item key={hour} id={String(hour)}>
                        <Accordion.Heading>
                          <Accordion.Trigger>
                            <span className='text-sm text-gray-500'>
                              {formatHour(hour)} – {formatHour(hour + 1)}
                            </span>
                            <Accordion.Indicator>
                              <ChevronDown />
                            </Accordion.Indicator>
                          </Accordion.Trigger>
                          <button
                            type="button"
                            aria-label={`Copy ${formatHour(hour)} – ${formatHour(hour + 1)} summary`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyHour(hour, hourEntries);
                            }}
                            className="mr-4 shrink-0 rounded p-1.5 text-foreground/50 hover:bg-default hover:text-foreground"
                          >
                            {copiedHour === hour ? (
                              <CopyCheck className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                          </button>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            {/*
                              react-aria's Disclosure always renders panel children
                              regardless of expanded state (only CSS-hides them), so
                              without this every hour's table — up to 24 — would stay
                              mounted at once. WorkLogTimeEntryCardTable flushes any
                              pending debounced edit on unmount, so collapsing an hour
                              here never drops in-progress work.
                            */}
                            {isExpanded && (
                              <WorkLogTimeEntryCardTable
                                entries={hourEntries}
                                loading={loading}
                                onEntryUpdated={handleEntryUpdated}
                                highlightEntryId={focusEntryId}
                              />
                            )}
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </div>

              <div className={`flex-1 min-h-0 ${showBreakdown ? "overflow-y-auto" : "hidden"}`}>
                <TicketBreakdown
                  hasSelection={!!selectedWorkLogId}
                  entries={entries}
                  loading={loading}
                  error={error}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkLogTimeEntryCardLayout