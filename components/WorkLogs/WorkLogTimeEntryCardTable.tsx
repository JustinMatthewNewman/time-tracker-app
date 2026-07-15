"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, CopyCheck, Pencil } from "@gravity-ui/icons";
import {
    useUpdateTimeEntry,
    useUpdateTimeEntryClearTicket,
} from "@/src/dataconnect-generated/react";
import type {
    UpdateTimeEntryVariables,
    UpdateTimeEntryClearTicketVariables,
} from "@/src/dataconnect-generated";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";
import { formatEntryClipboardLine } from "@/lib/entryClipboard";
import { TicketComboBox } from "./TicketComboBox";
import { TicketDialog } from "./TicketDialog";
import type { Ticket } from "@/context/TicketsContext";

interface WorkLogTimeEntryCardTableProps {
    entries: WorkLogTimeEntry[];
    loading?: boolean;
    onEntryUpdated?: () => void;
    // Set by a GlobalSearch result pick (see SelectedWorkLogContext.focusEntryId).
    // Only acted on if the id belongs to one of this table's own entries —
    // every hour's table receives the same value, but only the matching one
    // scrolls/flashes.
    highlightEntryId?: string | null;
}

type Drafts = Record<string, string>; // entryId -> description draft

const AUTOSAVE_DELAY_MS = 600;

// One shared dialog instance for the whole table rather than one per row —
// only one row's ticket can be created/edited at a time.
type DialogState =
    | { mode: "create"; entryId: string; initialTicketNumber?: number }
    | { mode: "edit"; entryId: string; ticket: Ticket };

function formatTime(isoDate: string) {
    return new Date(isoDate).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function WorkLogTimeEntryCardTable({
    entries,
    loading,
    onEntryUpdated,
    highlightEntryId,
}: WorkLogTimeEntryCardTableProps) {
    const updateMutation = useUpdateTimeEntry();
    const clearTicketMutation = useUpdateTimeEntryClearTicket();
    const [drafts, setDrafts] = useState<Drafts>({});
    const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<DialogState | null>(null);
    const [flashedEntryId, setFlashedEntryId] = useState<string | null>(null);
    const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    // Genuinely effectful: scrollIntoView is an imperative DOM action that
    // can't happen during render, and this also schedules a timer.
    useEffect(() => {
        if (!highlightEntryId) return;
        if (!entries.some((entry) => entry.id === highlightEntryId)) return;

        rowRefs.current[highlightEntryId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFlashedEntryId(highlightEntryId);
        const timeout = setTimeout(
            () => setFlashedEntryId((current) => (current === highlightEntryId ? null : current)),
            1800
        );
        return () => clearTimeout(timeout);
    }, [highlightEntryId, entries]);

    const handleCopyEntry = async (entry: WorkLogTimeEntry) => {
        try {
            await navigator.clipboard.writeText(formatEntryClipboardLine(entry));
            setCopiedEntryId(entry.id);
            setTimeout(() => setCopiedEntryId((current) => (current === entry.id ? null : current)), 1500);
        } catch (err) {
            console.error("Failed to copy time entry", err);
        }
    };

    // Mirrors kept in sync via effects (never mutated during render) so that
    // timers/unmount cleanup always see the latest values instead of whatever
    // was captured in the closure from the render that scheduled them.
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

            const run = async () => {
                if (entry.ticket) {
                    await updateMutation.mutateAsync({
                        entryId,
                        description,
                        ticketNumber: entry.ticket.ticketNumber,
                    } as UpdateTimeEntryVariables);
                } else {
                    await clearTicketMutation.mutateAsync({
                        entryId,
                        description,
                    } as UpdateTimeEntryClearTicketVariables);
                }
            };

            run()
                .then(() => onEntryUpdated?.())
                .catch((err) => console.error("Failed to save time entry", err));
        };
    });

    const getDescription = (entry: WorkLogTimeEntry) => drafts[entry.id] ?? entry.description ?? "";

    const setDescriptionDraft = (entryId: string, value: string) => {
        setDrafts((prev) => ({ ...prev, [entryId]: value }));

        clearTimeout(timersRef.current[entryId]);
        timersRef.current[entryId] = setTimeout(() => saveDescriptionRef.current(entryId), AUTOSAVE_DELAY_MS);
    };

    // Flush any pending edits immediately so switching views (or navigating away)
    // never silently drops an in-progress edit that hasn't hit the debounce yet.
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            Object.keys(timers).forEach((entryId) => {
                clearTimeout(timers[entryId]);
                saveDescriptionRef.current(entryId);
            });
        };
    }, []);

    // Ticket selection/clearing is a discrete action (not free text), so it
    // saves immediately rather than going through the description's debounce.
    const handleSelectTicket = async (entry: WorkLogTimeEntry, ticket: Ticket) => {
        try {
            await updateMutation.mutateAsync({
                entryId: entry.id,
                description: getDescription(entry),
                ticketNumber: ticket.ticketNumber,
            } as UpdateTimeEntryVariables);
            onEntryUpdated?.();
        } catch (err) {
            console.error("Failed to link ticket to time entry", err);
        }
    };

    const handleClearTicket = async (entry: WorkLogTimeEntry) => {
        try {
            await clearTicketMutation.mutateAsync({
                entryId: entry.id,
                description: getDescription(entry),
            } as UpdateTimeEntryClearTicketVariables);
            onEntryUpdated?.();
        } catch (err) {
            console.error("Failed to clear time entry's ticket", err);
        }
    };

    const handleDialogSaved = async (saved: Ticket) => {
        if (!dialogState) return;
        if (dialogState.mode === "create") {
            const entry = entriesRef.current.find((e) => e.id === dialogState.entryId);
            if (entry) await handleSelectTicket(entry, saved);
        } else {
            // Details changed on an already-linked ticket — refresh so the
            // locked Office cell picks up the new value.
            onEntryUpdated?.();
        }
    };

    if (loading) {
        return <div className="p-4 text-sm text-gray-500">Loading time entries...</div>;
    }

    if (entries.length === 0) {
        return <div className="p-4 text-sm text-gray-500">No time entries for this hour.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
                <thead>
                    <tr>
                        <th className="w-40 border p-2 text-left">Time</th>
                        <th className="w-48 border p-2 text-left">Ticket</th>
                        <th className="w-32 border p-2 text-left">Office</th>
                        <th className="border p-2 text-left">Description</th>
                        <th className="w-10 border p-2"></th>
                    </tr>
                </thead>

                <tbody>
                    {entries.map((entry) => (
                        <tr
                            key={entry.id}
                            ref={(el) => {
                                rowRefs.current[entry.id] = el;
                            }}
                            className={`transition-colors duration-700 ${
                                flashedEntryId === entry.id ? "bg-accent/20" : ""
                            }`}
                        >
                            <td className="border p-2 whitespace-nowrap">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </td>

                            <td className="border p-2">
                                <TicketComboBox
                                    ticket={entry.ticket ?? null}
                                    onSelect={(ticket) => handleSelectTicket(entry, ticket)}
                                    onClear={() => handleClearTicket(entry)}
                                    onRequestCreate={(ticketNumberText) => {
                                        const parsed = Number(ticketNumberText);
                                        setDialogState({
                                            mode: "create",
                                            entryId: entry.id,
                                            initialTicketNumber: Number.isInteger(parsed) ? parsed : undefined,
                                        });
                                    }}
                                />
                            </td>

                            <td className="border p-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">{entry.ticket?.office ?? "—"}</span>
                                    {entry.ticket && (
                                        <button
                                            type="button"
                                            aria-label={`Edit ticket ${entry.ticket.ticketNumber}`}
                                            onClick={() =>
                                                setDialogState({ mode: "edit", entryId: entry.id, ticket: entry.ticket! })
                                            }
                                            className="rounded p-1 text-foreground/40 hover:bg-default hover:text-foreground"
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                    )}
                                </div>
                            </td>

                            <td className="border p-2">
                                <textarea
                                    className="w-full rounded border p-2"
                                    rows={3}
                                    value={getDescription(entry)}
                                    onChange={(e) => setDescriptionDraft(entry.id, e.target.value)}
                                />
                            </td>

                            <td className="border p-2 text-center">
                                <button
                                    type="button"
                                    aria-label={`Copy ${formatTime(entry.startTime)} - ${formatTime(entry.endTime)} entry`}
                                    onClick={() => handleCopyEntry(entry)}
                                    className="rounded p-1.5 text-foreground/50 hover:bg-default hover:text-foreground"
                                >
                                    {copiedEntryId === entry.id ? (
                                        <CopyCheck className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {dialogState && (
                <TicketDialog
                    isOpen
                    mode={dialogState.mode}
                    initialTicketNumber={dialogState.mode === "create" ? dialogState.initialTicketNumber : undefined}
                    ticket={dialogState.mode === "edit" ? dialogState.ticket : undefined}
                    onClose={() => setDialogState(null)}
                    onSaved={handleDialogSaved}
                />
            )}
        </div>
    );
}

export default WorkLogTimeEntryCardTable;
