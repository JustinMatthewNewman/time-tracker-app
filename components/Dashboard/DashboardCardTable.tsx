"use client";

import type { Selection } from "@heroui/react";
import { Checkbox, Input, Table } from "@heroui/react";
import { useState } from "react";

interface TimeSlotRow {
    id: number;
    time: string;
    ticketNo: string;
    officeNo: string;
    workLog: string;
}

export function DashboardCardTable() {
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
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
        <Table className="w-full">
            <Table.ScrollContainer>
                <Table.Content
                    aria-label="Work Log"
                    selectedKeys={selectedKeys}
                    selectionMode="multiple"
                    onSelectionChange={setSelectedKeys}
                >
                    <Table.Header>
                        <Table.Column className="pr-0">
                            <Checkbox aria-label="Select all" slot="selection">
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                            </Checkbox>
                        </Table.Column>

                        <Table.Column id="time" isRowHeader className="w-38">
                            Time
                        </Table.Column>

                        <Table.Column id="ticket" className="w-12">
                            Ticket
                        </Table.Column>

                        <Table.Column id="office" className="w-28">
                            Office
                        </Table.Column>

                        <Table.Column id="worklog" className="min-w-[400px]">
                            Work Log
                        </Table.Column>
                    </Table.Header>

                    <Table.Body>
                        {rows.map((row) => (
                            <Table.Row key={row.id} id={row.id}>
                                <Table.Cell className="pr-0">
                                    <Checkbox
                                        aria-label={`Select row ${row.id}`}
                                        slot="selection"
                                        variant="secondary"
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                    </Checkbox>
                                </Table.Cell>

                                <Table.Cell className="py-2">{row.time}</Table.Cell>

                                <Table.Cell className="py-2">
                                    <Input
                                        value={row.ticketNo}
                                        onChange={(e) => updateRow(row.id, "ticketNo", e.target.value)}
                                    />
                                </Table.Cell>

                                <Table.Cell className="py-2">
                                    <textarea
                                        value={row.officeNo}
                                        onChange={(e) => updateRow(row.id, "officeNo", e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        className="w-full px-2 py-1 border border-default-200 rounded text-sm"
                                        rows={2}
                                    />
                                </Table.Cell>

                                <Table.Cell className="py-2">
                                    <textarea
                                        className="w-full px-2 py-1 border border-default-200 rounded text-sm"
                                        value={row.workLog}
                                        onChange={(e) => updateRow(row.id, "workLog", e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        rows={2}
                                    />
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Content>
            </Table.ScrollContainer>
        </Table>
    );
}

export default DashboardCardTable;