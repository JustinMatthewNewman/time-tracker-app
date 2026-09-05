"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRightFromSquare, Check, ChevronDown, Pencil, Ticket as TicketIcon, Xmark } from "@gravity-ui/icons";
import { Accordion, Button, Card, EmptyState, Input, Label, Skeleton, Spinner, TextField } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/context/TicketsContext";
import { useTimeEntriesByTicket, type TicketTimeEntry } from "@/hooks/useTimeEntriesByTicket";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { formatDayKey, normalizeDayKey, type DayKey } from "@/lib/dayKeys";
import { TicketDayEntriesTable } from "./TicketDayEntriesTable";
import { TicketTotals } from "./TicketTotals";
import { TicketColorPicker } from "./TicketColorPicker";
import { useTicketColors } from "@/hooks/useTicketColors";
import { autoTicketColor } from "@/lib/ticketColor";
import AmbientBackground from "@/components/AmbientBackground";

const TICKET_ID_PLACEHOLDER = "{ticket_id}";

interface TicketPageProps {
  ticketNumberParam: string;
}

export function TicketPage({ ticketNumberParam }: TicketPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tickets, loading: ticketsLoading, updateTicketDetails } = useTickets();
  const { setSelectedWorkLogId, setFocusEntryId } = useSelectedWorkLog();
  const { externalTicketLinkTemplate } = useUserSettings();
  const ticketColors = useTicketColors();

  const ticketNumber = Number(ticketNumberParam);
  const isValidTicketNumber = Number.isInteger(ticketNumber);
  const ticket = isValidTicketNumber ? tickets.find((t) => t.ticketNumber === ticketNumber) : undefined;

  const externalTicketLink =
    ticket && externalTicketLinkTemplate?.includes(TICKET_ID_PLACEHOLDER)
      ? externalTicketLinkTemplate.replace(TICKET_ID_PLACEHOLDER, String(ticket.ticketNumber))
      : null;

  const { entries, loading: entriesLoading, refetch: refetchEntries } = useTimeEntriesByTicket(
    isValidTicketNumber ? ticketNumber : null
  );

  const [isEditingOffice, setIsEditingOffice] = useState(false);
  const [officeDraft, setOfficeDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleSaveError, setTitleSaveError] = useState<string | null>(null);

  // Grouped once per entries change (O(n)) rather than re-filtering on every
  // render — same approach as WorkLogTimeEntryCardLayout's entriesByHour.
  const entriesByDay = useMemo(() => {
    const map = new Map<DayKey, TicketTimeEntry[]>();
    for (const entry of entries) {
      const day = normalizeDayKey(entry.date);
      const bucket = map.get(day);
      if (bucket) bucket.push(entry);
      else map.set(day, [entry]);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    return map;
  }, [entries]);

  // date is an ISO yyyy-mm-dd string, so lexicographic sort is chronological.
  const days = useMemo(() => Array.from(entriesByDay.keys()).sort((a, b) => b.localeCompare(a)), [entriesByDay]);

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // Mirrors GlobalSearch's selectResult: jump to /worklogs with the entry's
  // work log selected and flagged to auto-expand/scroll/flash, rather than
  // just switching work logs and leaving the user to find the entry again.
  const goToEntryWorkLog = (entry: TicketTimeEntry) => {
    if (!entry.workLog) return;
    setSelectedWorkLogId(entry.workLog.id);
    setFocusEntryId(entry.id);
    router.push("/worklogs");
  };

  const startEditingOffice = () => {
    setOfficeDraft(ticket?.office ?? "");
    setSaveError(null);
    setIsEditingOffice(true);
  };

  const handleSaveOffice = async () => {
    if (!ticket) return;
    const trimmed = officeDraft.trim();
    if (!trimmed) {
      setSaveError("Office is required");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await updateTicketDetails({ ticketNumber: ticket.ticketNumber, office: trimmed });
      setIsEditingOffice(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save office");
    } finally {
      setSaving(false);
    }
  };

  const startEditingTitle = () => {
    setTitleDraft(ticket?.ticketTitle ?? "");
    setTitleSaveError(null);
    setIsEditingTitle(true);
  };

  const handleSaveColor = async (color: string | null) => {
    if (!ticket) return;
    // null is sent through rather than omitted — UpdateTicketInput treats it
    // as "clear this column", where an absent key would leave it untouched.
    await updateTicketDetails({ ticketNumber: ticket.ticketNumber, color });
  };

  const handleSaveTitle = async () => {
    if (!ticket) return;
    setSavingTitle(true);
    setTitleSaveError(null);
    try {
      await updateTicketDetails({ ticketNumber: ticket.ticketNumber, ticketTitle: titleDraft.trim() });
      setIsEditingTitle(false);
    } catch (err) {
      setTitleSaveError(err instanceof Error ? err.message : "Failed to save title");
    } finally {
      setSavingTitle(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
      <AmbientBackground intensity={0.85} />
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col gap-6">
        <Button variant="ghost" size="sm" className="w-fit shrink-0" onClick={() => router.push("/worklogs")}>
          <ArrowLeft className="size-4" /> Back to work logs
        </Button>

        {!isValidTicketNumber ? (
          <Card className="p-6">
            <p className="text-sm text-foreground/60">
              &quot;{ticketNumberParam}&quot; isn&apos;t a valid ticket number.
            </p>
          </Card>
        ) : ticketsLoading && !ticket ? (
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-7 w-40 rounded" />
            </div>
            <div className="mt-6 max-w-xs space-y-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
          </Card>
        ) : !ticket ? (
          <EmptyState className="p-12">
            <TicketIcon className="size-8 text-foreground/40" />
            <p className="text-lg font-semibold">Ticket #{ticketNumber} not found</p>
            <p className="text-sm text-foreground/60">
              This ticket hasn&apos;t been linked to any time entry yet.
            </p>
          </EmptyState>
        ) : (
          <>
            {/* Header wears the ticket's colour: a faint wash plus a solid
                left edge, matching how its rows read elsewhere. Muted enough
                to sit under body text — the edge is what actually carries the
                identity at a glance. */}
            <Card
              className="shrink-0 p-6"
              style={{
                ...ticketColors.rowStyle(ticket.ticketNumber),
                ...ticketColors.edgeStyle(ticket.ticketNumber),
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <TicketIcon
                    className={`mt-0.5 size-6 shrink-0 ${
                      ticketColors.colorFor(ticket.ticketNumber) ? "" : "text-accent"
                    }`}
                    style={
                      ticketColors.colorFor(ticket.ticketNumber)
                        ? { color: ticketColors.colorFor(ticket.ticketNumber)! }
                        : undefined
                    }
                  />
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold">Ticket #{ticket.ticketNumber}</h1>

                    {isEditingTitle ? (
                      <div className="mt-2 flex max-w-sm flex-col gap-2">
                        <TextField
                          value={titleDraft}
                          onChange={setTitleDraft}
                          isDisabled={savingTitle}
                          autoFocus
                        >
                          <Label>Title</Label>
                          <Input placeholder="e.g. Migrate billing service" />
                        </TextField>
                        {titleSaveError && <p className="text-sm text-danger">{titleSaveError}</p>}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveTitle} isDisabled={savingTitle}>
                            <Check className="size-4" /> {savingTitle ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingTitle(false)}
                            isDisabled={savingTitle}
                          >
                            <Xmark className="size-4" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`text-sm ${ticket.ticketTitle ? "text-foreground/60" : "italic text-foreground/40"}`}
                        >
                          {ticket.ticketTitle || "Add a title"}
                        </span>
                        <button
                          type="button"
                          aria-label={ticket.ticketTitle ? "Edit title" : "Add title"}
                          onClick={startEditingTitle}
                          className="rounded p-1 text-foreground/40 hover:bg-default hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="mt-2 max-w-md">
                      <TicketColorPicker
                        value={ticket.color}
                        fallback={autoTicketColor(ticket.ticketNumber)}
                        onSave={handleSaveColor}
                      />
                    </div>
                  </div>
                </div>

                {externalTicketLink && (
                  <a
                    href={externalTicketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-1.5 text-sm text-accent hover:underline"
                  >
                    <ArrowUpRightFromSquare className="size-3.5" /> View in external system
                  </a>
                )}
              </div>

              {/* Office stays left; the time totals sit opposite it on the
                  right. items-start keeps both aligned to the same top edge
                  while the office field grows into its editing form. */}
              <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
                <div className="max-w-xs">
                  {isEditingOffice ? (
                    <div className="flex flex-col gap-2">
                      <TextField
                        value={officeDraft}
                        onChange={setOfficeDraft}
                        isDisabled={saving}
                        autoFocus
                      >
                        <Label>Office</Label>
                        <Input placeholder="e.g. PRODAppX" />
                      </TextField>
                      {saveError && <p className="text-sm text-danger">{saveError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveOffice} isDisabled={saving}>
                          <Check className="size-4" /> {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingOffice(false)}
                          isDisabled={saving}
                        >
                          <Xmark className="size-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                        Office
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{ticket.office ?? "—"}</span>
                        <button
                          type="button"
                          aria-label="Edit office"
                          onClick={startEditingOffice}
                          className="rounded p-1 text-foreground/40 hover:bg-default hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <TicketTotals entriesByDay={entriesByDay} days={days} loading={entriesLoading} />
              </div>
            </Card>

            <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
              <h2 className="mb-4 shrink-0 px-2 text-lg font-semibold">Time entries</h2>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {entriesLoading ? (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                ) : entries.length === 0 ? (
                  <EmptyState className="p-8">
                    <p className="text-sm text-foreground/60">No time entries reference this ticket yet.</p>
                  </EmptyState>
                ) : (
                  <Accordion
                    className="w-full"
                    expandedKeys={expandedDays}
                    onExpandedChange={(keys) => setExpandedDays(new Set(Array.from(keys, String)))}
                  >
                    {days.map((day) => {
                      const dayEntries = entriesByDay.get(day) ?? [];
                      const isExpanded = expandedDays.has(day);

                      return (
                        <Accordion.Item key={day} id={day}>
                          <Accordion.Heading>
                            <Accordion.Trigger>
                              <span className="text-sm text-gray-500">{formatDayKey(day)}</span>
                              <Accordion.Indicator>
                                <ChevronDown />
                              </Accordion.Indicator>
                            </Accordion.Trigger>
                          </Accordion.Heading>
                          <Accordion.Panel>
                            <Accordion.Body>
                              {/* Same lazy-mount-on-expand rationale as WorkLogTimeEntryCardLayout:
                                  react-aria's Disclosure always renders panel children regardless of
                                  expanded state, so without this every day would stay mounted at once. */}
                              {isExpanded && (
                                <TicketDayEntriesTable
                                  entries={dayEntries}
                                  ticketNumber={ticket.ticketNumber}
                                  onEntryUpdated={refetchEntries}
                                  onViewWorkLog={goToEntryWorkLog}
                                />
                              )}
                            </Accordion.Body>
                          </Accordion.Panel>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default TicketPage;
