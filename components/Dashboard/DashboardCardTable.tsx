"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTimeRange } from "@/context/TimeRangeContext";
import { useAuth } from "@/hooks/useAuth";

interface TimeSlotRow {
    id: string;
    time: string;
    startHour: number;
    ticketNo: string;
    officeNo: string;
    workLog: string;
    syncing?: boolean;
    error?: string;
    dbId?: string;
}

export function DashboardCardTable() {
    const { timeSlots } = useTimeRange();
    const { user } = useAuth();
    const [rows, setRows] = useState<TimeSlotRow[]>([]);
    const updateTimers = useRef<Record<string, NodeJS.Timeout>>({});

    // Initialize rows on mount
    useEffect(() => {
        const newRows: TimeSlotRow[] = timeSlots.map((hour) => ({
            id: `slot-${hour}`,
            time: `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"} - ${hour + 1 > 12 ? hour + 1 - 12 : hour + 1 === 12 ? 12 : hour + 1}:00 ${hour + 1 >= 12 ? "PM" : "AM"}`,
            startHour: hour,
            ticketNo: "",
            officeNo: "",
            workLog: "",
        }));
        setRows(newRows);
    }, [timeSlots]);

    const updateRow = useCallback(
        (id: string, field: keyof Omit<TimeSlotRow, "id" | "time" | "startHour" | "syncing" | "error" | "dbId">, value: string) => {
            setRows((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, [field]: value, syncing: true, error: undefined } : row
                )
            );

            // Clear existing timer
            if (updateTimers.current[id]) {
                clearTimeout(updateTimers.current[id]);
            }

            // Simulate sync (500ms debounce)
            updateTimers.current[id] = setTimeout(() => {
                setRows((prev) =>
                    prev.map((r) => (r.id === id ? { ...r, syncing: false } : r))
                );
            }, 500);
        },
        []
    );

    if (!user) {
        return <div className="p-4 text-center text-gray-500">Please log in to use the worklog.</div>;
    }

    return (
        <div className="w-full overflow-x-auto">
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
                                {row.syncing ? (
                                    <span className="text-yellow-600 animate-spin">⟳</span>
                                ) : (
                                    <span className="text-green-600">✓</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-2 text-xs text-gray-500 px-4">
                ✓ Local state working. Firebase SQL Connect integration coming next.
            </div>
        </div>
    );
}

export default DashboardCardTable;
