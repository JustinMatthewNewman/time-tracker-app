"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useTimeRange } from "@/context/TimeRangeContext";

interface TimeSlotRow {
    id: string;
    time: string;
    startHour: number;
    ticketNo: string;
    officeNo: string;
    workLog: string;
    syncing?: boolean;
    error?: string;
}

export function DashboardCardTable() {
    const { entries, fetchEntries, createEntry, updateEntry, loading, error } = useTimeEntries();
    const { timeSlots } = useTimeRange();
    const [rows, setRows] = useState<TimeSlotRow[]>([]);
    const updateTimers = useRef<Record<string, NodeJS.Timeout>>({});

    // Initialize rows from API data
    useEffect(() => {
        const initializeRows = async () => {
            await fetchEntries();
        };
        initializeRows();
    }, [fetchEntries]);

    // Map entries to table rows and create empty slots for unmapped times
    useEffect(() => {
        const newRows: TimeSlotRow[] = [];

        timeSlots.forEach((hour) => {
            const startTime = new Date();
            startTime.setHours(hour, 0, 0, 0);
            const endTime = new Date(startTime);
            endTime.setHours(hour + 1, 0, 0, 0);

            const entry = entries.find((e) => {
                const entryStart = new Date(e.startTime);
                return entryStart.getHours() === hour;
            });

            newRows.push({
                id: entry?.id || `slot-${hour}`,
                time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"} - ${hour + 1 > 12 ? hour + 1 - 12 : hour + 1}:00 ${hour + 1 >= 12 ? "PM" : "AM"}`,
                startHour: hour,
                ticketNo: entry?.id?.split("-")[0] || "",
                officeNo: entry?.category || "",
                workLog: entry?.description || "",
            });
        });

        setRows(newRows);
    }, [entries, timeSlots]);

    const updateRow = useCallback(
        (id: string, field: keyof Omit<TimeSlotRow, "id" | "time" | "startHour" | "syncing" | "error">, value: string) => {
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, [field]: value, syncing: true, error: undefined } : row
                )
            );

            // Clear existing timer for this row
            if (updateTimers.current[id]) {
                clearTimeout(updateTimers.current[id]);
            }

            // Debounce sync to DB (500ms after last change)
            updateTimers.current[id] = setTimeout(async () => {
                const row = rows.find((r) => r.id === id);
                if (!row) return;

                try {
                    const startTime = new Date();
                    startTime.setHours(row.startHour, 0, 0, 0);
                    const endTime = new Date(startTime);
                    endTime.setHours(row.startHour + 1, 0, 0, 0);

                    if (row.id.startsWith("slot-")) {
                        // Create new entry
                        await createEntry({
                            title: row.ticketNo || "Untitled",
                            description: row.workLog,
                            category: row.officeNo || "Work",
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
                            tags: [],
                        });
                    } else {
                        // Update existing entry
                        await updateEntry(row.id, {
                            title: row.ticketNo || "Untitled",
                            description: row.workLog,
                            category: row.officeNo || "Work",
                        });
                    }

                    setRows((prev) =>
                        prev.map((r) => (r.id === id ? { ...r, syncing: false } : r))
                    );
                } catch (err) {
                    const message = err instanceof Error ? err.message : "Sync failed";
                    setRows((prev) =>
                        prev.map((r) => (r.id === id ? { ...r, syncing: false, error: message } : r))
                    );
                }
            }, 500);
        },
        [rows, createEntry, updateEntry]
    );

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading worklog...</div>;
    }

    return (
        <div className="w-full overflow-x-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    ⚠️ {error}
                </div>
            )}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold w-38">
                            Time
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold w-32">
                            Ticket
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold w-40">
                            Office/Category
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold min-w-96">
                            Work Log
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold w-16">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                                {row.time}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <input
                                    type="text"
                                    value={row.ticketNo}
                                    onChange={(e) => updateRow(row.id, "ticketNo", e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Ticket #"
                                />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <textarea
                                    value={row.officeNo}
                                    onChange={(e) => updateRow(row.id, "officeNo", e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                    rows={2}
                                    placeholder="Office/Category"
                                />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                <textarea
                                    value={row.workLog}
                                    onChange={(e) => updateRow(row.id, "workLog", e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                    rows={2}
                                    placeholder="Work log details..."
                                />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center text-xs">
                                {row.error ? (
                                    <span className="text-red-600" title={row.error}>❌</span>
                                ) : row.syncing ? (
                                    <span className="text-yellow-600 animate-spin">⟳</span>
                                ) : row.id.startsWith("slot-") ? (
                                    <span className="text-gray-400">◯</span>
                                ) : (
                                    <span className="text-green-600">✓</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-500 px-4">
                ⚡ Changes sync automatically. Green ✓ = saved, ⟳ = syncing, ❌ = error, ◯ = unsaved
            </div>
        </div>
    );
}

export default DashboardCardTable;
