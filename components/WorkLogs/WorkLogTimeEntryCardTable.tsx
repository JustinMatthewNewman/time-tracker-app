"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, CopyCheck } from "@gravity-ui/icons";
import {
    useUpdateTimeEntry,
    useUpdateTimeEntryClearTicket,
    useUpsertTicket,
} from "@/src/dataconnect-generated/react";
import type {
    UpdateTimeEntryVariables,
    UpdateTimeEntryClearTicketVariables,
    UpsertTicketVariables,
} from "@/src/dataconnect-generated";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";
import { formatEntryClipboardLine } from "@/lib/entryClipboard";

interface WorkLogTimeEntryCardTableProps {
    entries: WorkLogTimeEntry[];
    loading?: boolean;
    onEntryUpdated?: () => void;
}

type EditableField = "ticketNumber" | "officeNumber" | "description";
type Drafts = Record<string, Partial<Record<EditableField, string>>>;

const AUTOSAVE_DELAY_MS = 600;

function formatTime(isoDate: string) {
    return new Date(isoDate).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function WorkLogTimeEntryCardTable({ entries, loading, onEntryUpdated }: WorkLogTimeEntryCardTableProps) {
    const upsertTicketMutation = useUpsertTicket();
    const updateMutation = useUpdateTimeEntry();
    const clearTicketMutation = useUpdateTimeEntryClearTicket();
    const [drafts, setDrafts] = useState<Drafts>({});
    const [copiedEntryId, setCopiedEntryId] = useState<string | null>(null);

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
    const saveEntryRef = useRef<(entryId: string) => void>(() => {});

    useEffect(() => {
        draftsRef.current = drafts;
    }, [drafts]);

    useEffect(() => {
        entriesRef.current = entries;
    }, [entries]);

    useEffect(() => {
        saveEntryRef.current = (entryId: string) => {
            const draft = draftsRef.current[entryId];
            const entry = entriesRef.current.find((e) => e.id === entryId);
            if (!draft || !entry) return;

            const description = draft.description ?? entry.description ?? undefined;
            const officeNumber = draft.officeNumber ?? entry.officeNumber ?? undefined;
            const ticketText = (
                draft.ticketNumber ?? (entry.ticket ? String(entry.ticket.ticketNumber) : "")
            ).trim();

            const run = async () => {
                if (ticketText === "") {
                    await clearTicketMutation.mutateAsync({
                        entryId,
                        description,
                        officeNumber,
                    } as UpdateTimeEntryClearTicketVariables);
                    return;
                }

                const ticketNumber = Number(ticketText);
                // Non-integer input is left unsaved (ticket and other fields)
                // rather than silently coerced, since there's no valid ticket
                // row to attach the entry to.
                if (!Number.isInteger(ticketNumber)) return;

                // Ensures the Ticket row exists before the entry references it;
                // ticketLink is left untouched since this table doesn't collect it.
                await upsertTicketMutation.mutateAsync({ ticketNumber } as UpsertTicketVariables);
                await updateMutation.mutateAsync({
                    entryId,
                    description,
                    ticketNumber,
                    officeNumber,
                } as UpdateTimeEntryVariables);
            };

            run()
                .then(() => onEntryUpdated?.())
                .catch((err) => console.error("Failed to save time entry", err));
        };
    });

    const getValue = (entry: WorkLogTimeEntry, field: EditableField) => {
        const draftValue = drafts[entry.id]?.[field];
        if (draftValue !== undefined) return draftValue;
        if (field === "ticketNumber") return entry.ticket ? String(entry.ticket.ticketNumber) : "";
        return entry[field] ?? "";
    };

    const setDraftValue = (entryId: string, field: EditableField, value: string) => {
        setDrafts((prev) => ({
            ...prev,
            [entryId]: { ...prev[entryId], [field]: value },
        }));

        clearTimeout(timersRef.current[entryId]);
        timersRef.current[entryId] = setTimeout(() => saveEntryRef.current(entryId), AUTOSAVE_DELAY_MS);
    };

    // Flush any pending edits immediately so switching views (or navigating away)
    // never silently drops an in-progress edit that hasn't hit the debounce yet.
    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            Object.keys(timers).forEach((entryId) => {
                clearTimeout(timers[entryId]);
                saveEntryRef.current(entryId);
            });
        };
    }, []);

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
                        <th className="w-24 border p-2 text-left">Ticket</th>
                        <th className="w-20 border p-2 text-left">Office</th>
                        <th className="border p-2 text-left">Description</th>
                        <th className="w-10 border p-2"></th>
                    </tr>
                </thead>

                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.id}>
                            <td className="border p-2 whitespace-nowrap">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                            </td>

                            <td className="border p-2">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    className="w-full rounded border p-2"
                                    value={getValue(entry, "ticketNumber")}
                                    onChange={(e) => setDraftValue(entry.id, "ticketNumber", e.target.value)}
                                />
                            </td>

                            <td className="border p-2">
                                <input
                                    type="text"
                                    className="w-full rounded border p-2"
                                    value={getValue(entry, "officeNumber")}
                                    onChange={(e) => setDraftValue(entry.id, "officeNumber", e.target.value)}
                                />
                            </td>

                            <td className="border p-2">
                                <textarea
                                    className="w-full rounded border p-2"
                                    rows={3}
                                    value={getValue(entry, "description")}
                                    onChange={(e) => setDraftValue(entry.id, "description", e.target.value)}
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
        </div>
    );
}

export default WorkLogTimeEntryCardTable;
