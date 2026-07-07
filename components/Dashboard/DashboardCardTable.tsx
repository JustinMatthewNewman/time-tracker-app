"use client";

import { useState } from "react";

interface TimeSlotRow {
    id: number;
    time: string;
    ticketNo: string;
    officeNo: string;
    workLog: string;
}

function formatTime(date: Date) {
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function generateTimeSlots(
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    intervalMinutes = 15
): TimeSlotRow[] {
    const rows: TimeSlotRow[] = [];

    const current = new Date();
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    let id = 1;

    while (current < end) {
        const slotStart = new Date(current);

        current.setMinutes(current.getMinutes() + intervalMinutes);

        rows.push({
            id: id++,
            time: `${formatTime(slotStart)} - ${formatTime(current)}`,
            ticketNo: "",
            officeNo: "",
            workLog: "",
        });
    }

    return rows;
}

export function DashboardCardTable() {
    const [rows, setRows] = useState<TimeSlotRow[]>(
        generateTimeSlots(8, 0, 17, 0) // 8:00 AM - 5:00 PM
    );

    const [selectionStart, setSelectionStart] = useState<number | null>(null);

    const updateRow = (
        id: number,
        field: keyof Omit<TimeSlotRow, "id" | "time">,
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    const isRowEmpty = (row: TimeSlotRow) => {
        return !row.ticketNo && !row.officeNo && !row.workLog;
    };

    const canMergeRange = (start: number, end: number) => {
        for (let i = start; i <= end; i++) {
            if (!isRowEmpty(rows[i])) {
                return false;
            }
        }
        return true;
    };

    const mergeRange = (start: number, end: number) => {
        const newRows = [...rows];

        const startRow = newRows[start];
        const endRow = newRows[end];

        const startTime = startRow.time.split(" - ")[0];
        const endTime = endRow.time.split(" - ")[1];

        newRows[start] = {
            ...startRow,
            time: `${startTime} - ${endTime}`,
        };

        newRows.splice(start + 1, end - start);

        setRows(newRows);
    };

    const handleRowClick = (
        index: number,
        e: React.MouseEvent<HTMLTableRowElement>
    ) => {
        // Ignore clicks originating from inputs/textareas
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement
        ) {
            return;
        }

        // First click selects a row
        if (selectionStart === null || !e.shiftKey) {
            setSelectionStart(index);
            return;
        }

        // Shift + click merges a range
        const start = Math.min(selectionStart, index);
        const end = Math.max(selectionStart, index);

        if (canMergeRange(start, end)) {
            mergeRange(start, end);
        }

        setSelectionStart(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
                <thead>
                    <tr>
                        <th className="w-40 border p-2 text-left">Time</th>
                        <th className="w-24 border p-2 text-left">Ticket</th>
                        <th className="w-20 border p-2 text-left">Office</th>
                        <th className="border p-2 text-left">Work Log</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={row.id}
                            onClick={(e) => handleRowClick(index, e)}
                            className={`cursor-pointer hover:bg-gray-100 ${
                                selectionStart === index
                                    ? "bg-blue-100"
                                    : ""
                            }`}
                        >
                            <td className="border p-2">{row.time}</td>

                            <td className="border p-2">
                                <input
                                    type="text"
                                    className="w-full rounded border p-2"
                                    value={row.ticketNo}
                                    onChange={(e) =>
                                        updateRow(
                                            row.id,
                                            "ticketNo",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>

                            <td className="border p-2">
                                <input
                                    type="text"
                                    className="w-full rounded border p-2"
                                    value={row.officeNo}
                                    onChange={(e) =>
                                        updateRow(
                                            row.id,
                                            "officeNo",
                                            e.target.value
                                        )
                                    }
                                />
                            </td>

                            <td className="border p-2">
                                <textarea
                                    className="w-full rounded border p-2"
                                    rows={3}
                                    value={row.workLog}
                                    onChange={(e) =>
                                        updateRow(
                                            row.id,
                                            "workLog",
                                            e.target.value
                                        )
                                    }
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