"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRightFromSquare, Check, ChevronDown, Pencil, Ticket as TicketIcon, Xmark } from "@gravity-ui/icons";
import { Accordion, Button, Card, EmptyState, Input, Label, Spinner, TextField } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/context/TicketsContext";
import { useTimeEntriesByTicket, type TicketTimeEntry } from "@/hooks/useTimeEntriesByTicket";
import { useSelectedWorkLog } from "@/context/SelectedWorkLogContext";
import { useUserSettings } from "@/context/UserSettingsContext";
import { TicketDayEntriesTable } from "./TicketDayEntriesTable";
import AmbientBackground from "@/components/AmbientBackground";

const TICKET_ID_PLACEHOLDER = "{ticket_id}";

interface TicketPageProps {
  ticketNumberParam: string;
}

function formatDayHeading(isoDate: string) {
  return new Date(isoDate).toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TicketPage({ ticketNumberParam }: TicketPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tickets, loading: ticketsLoading, updateTicketDetails } = useTickets();
  const { setSelectedWorkLogId, setFocusEntryId } = useSelectedWorkLog();
  const { externalTicketLinkTemplate } = useUserSettings();

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

  // Grouped once per entries change (O(n)) rather than re-filtering on every
  // render — same approach as WorkLogTimeEntryCardLayout's entriesByHour.
  const entriesByDay = useMemo(() => {
    const map = new Map<string, TicketTimeEntry[]>();
    for (const entry of entries) {
      const bucket = map.get(entry.date);
      if (bucket) bucket.push(entry);
      else map.set(entry.date, [entry]);
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
      await updateTicketDetails({
        ticketNumber: ticket.ticketNumber,
        office: trimmed,
        ticketTitle: ticket.ticketTitle ?? undefined,
        ticketLink: ticket.ticketLink ?? undefined,
      });
      setIsEditingOffice(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save office");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner aria-label="Loading" />
      </div>
    );
  }

  if (!user) return null; // redirect in flight

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6">
      <AmbientBackground intensity={0.85} />
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
        <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push("/worklogs")}>
          <ArrowLeft className="size-4" /> Back to work logs
        </Button>

        {!isValidTicketNumber ? (
          <Card className="p-6">
            <p className="text-sm text-foreground/60">
              &quot;{ticketNumberParam}&quot; isn&apos;t a valid ticket number.
            </p>
          </Card>
        ) : ticketsLoading && !ticket ? (
          <div className="flex items-center justify-center p-12">
            <Spinner aria-label="Loading ticket" />
          </div>
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
            <Card className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <TicketIcon className="size-6 text-accent" />
                  <div>
                    <h1 className="text-2xl font-bold">Ticket #{ticket.ticketNumber}</h1>
                    {ticket.ticketTitle && (
                      <p className="text-sm text-foreground/60">{ticket.ticketTitle}</p>
                    )}
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

              <div className="mt-6 max-w-xs">
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
            </Card>

            <Card className="p-4">
              <h2 className="mb-4 px-2 text-lg font-semibold">Time entries</h2>

              {entriesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner aria-label="Loading time entries" />
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
                            <span className="text-sm text-gray-500">{formatDayHeading(day)}</span>
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
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default TicketPage;
