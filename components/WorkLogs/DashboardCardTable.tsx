"use client";

import { useEffect, useRef, useState } from "react";
import { useUpdateTimeEntry } from "@/src/dataconnect-generated/react";
import type { UpdateTimeEntryVariables } from "@/src/dataconnect-generated";
import type { WorkLogTimeEntry } from "@/hooks/useTimeEntriesByWorkLog";

interface DashboardCardTableProps {
    entries: WorkLogTimeEntry[];
    loading?: boolean;
    onEntryUpdated?: () => void;
}

type EditableField = "ticketNumber" | "officeNumber" | "description";

const AUTOSAVE_DELAY_MS = 600;

function formatTime(isoDate: string) {
    return new Date(isoDate).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function DashboardCardTable({ entries, loading, onEntryUpdated }: DashboardCardTableProps) {
    const updateMutation = useUpdateTimeEntry();
    const [drafts, setDrafts] = useState<Record<string, Partial<WorkLogTimeEntry>>>({});

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

            updateMutation
                .mutateAsync({
                    entryId,
                    description: draft.description ?? entry.description ?? undefined,
                    ticketNumber: draft.ticketNumber ?? entry.ticketNumber ?? undefined,
                    officeNumber: draft.officeNumber ?? entry.officeNumber ?? undefined,
                } as UpdateTimeEntryVariables)
                .then(() => onEntryUpdated?.())
                .catch((err) => console.error("Failed to save time entry", err));
        };
    });

    const getValue = (entry: WorkLogTimeEntry, field: EditableField) =>
        drafts[entry.id]?.[field] ?? entry[field] ?? "";

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
                                    type="text"
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardCardTable;
