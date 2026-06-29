"use client";

import { useState } from "react";

interface TimeSlotRow {
    id: number;
    time: string;
    ticketNo: string;
    officeNo: string;
    workLog: string;
}

export function DashboardCardTable() {
    const [rows, setRows] = useState<TimeSlotRow[]>([
        { id: 1, time: "8:00 AM - 8:15 AM", ticketNo: "", officeNo: "", workLog: "" },
        { id: 2, time: "8:15 AM - 8:30 AM", ticketNo: "", officeNo: "", workLog: "" },
        { id: 3, time: "8:30 AM - 8:45 AM", ticketNo: "", officeNo: "", workLog: "" },
        { id: 4, time: "8:45 AM - 9:00 AM", ticketNo: "", officeNo: "", workLog: "" },
    ]);

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
            if (!isRowEmpty(rows[i])) return false;
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

    const handleRowClick = (index: number, e: React.MouseEvent) => {
        // First click sets start
        if (selectionStart === null || !e.shiftKey) {
            setSelectionStart(index);
            return;
        }

        // Shift + click attempts merge
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
                        <th className="border p-2 text-left w-38">Time</th>
                        <th className="border p-2 text-left w-24">Ticket</th>
                        <th className="border p-2 text-left w-16">Office</th>
                        <th className="border p-2 text-left">Work Log</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, index) => (
                        <tr
                            key={row.id}
                            onClick={(e) => handleRowClick(index, e)}
                            className="cursor-pointer hover:bg-gray-100"
                        >
                            <td className="border p-2">{row.time}</td>

                            <td className="border p-2">
                                <input
                                    type="text"
                                    className="w-full rounded border p-2"
                                    value={row.ticketNo}
                                    onChange={(e) =>
                                        updateRow(row.id, "ticketNo", e.target.value)
                                    }
                                />
                            </td>

                            <td className="border p-2">
                                <input
                                    type="text"
                                    className="w-full rounded border p-2"
                                    value={row.officeNo}
                                    onChange={(e) =>
                                        updateRow(row.id, "officeNo", e.target.value)
                                    }
                                />
                            </td>

                            <td className="border p-2">
                                <textarea
                                    className="w-full rounded border p-2"
                                    rows={3}
                                    value={row.workLog}
                                    onChange={(e) =>
                                        updateRow(row.id, "workLog", e.target.value)
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