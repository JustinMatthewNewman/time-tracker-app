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

    const updateRow = (
        id: number,
        field: keyof Omit<TimeSlotRow, "id" | "time">,
        value: string,
    ) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
        );
    };

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
                            Office
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold min-w-96">
                            Work Log
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
                                    placeholder="Office info"
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardCardTable;
