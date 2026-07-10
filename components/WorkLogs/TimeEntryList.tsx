"use client";

import React, { useEffect, useState } from "react";
import { Card, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@heroui/react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeEntry } from "@/lib/schemas";

interface TimeEntryListProps {
  refreshTrigger?: number;
}

/**
 * Component to display list of time entries
 */
export function TimeEntryList({ refreshTrigger }: TimeEntryListProps) {
  const { entries, loading, error, fetchEntries, deleteEntry } = useTimeEntries();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    setDeleting(id);
    try {
      await deleteEntry(id);
    } finally {
      setDeleting(null);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Spinner size="sm" />
          <p>Loading entries...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <p className="text-red-700 text-sm">{error}</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground/60 mb-2">📭 No time entries yet</p>
        <p className="text-sm text-foreground/40">Create your first entry to get started</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Table>
        <TableHeader>
          <TableColumn>Title</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Duration</TableColumn>
          <TableColumn>Start Time</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {entries.map((entry: TimeEntry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <div>
                  <p className="font-semibold">{entry.title}</p>
                  {entry.description && (
                    <p className="text-xs text-foreground/60">{entry.description}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {entry.category}
                </span>
              </TableCell>
              <TableCell>{formatDuration(entry.duration)}</TableCell>
              <TableCell className="text-sm">
                {new Date(entry.startTime).toLocaleString()}
              </TableCell>
              <TableCell>
                <button
                  className="text-lg hover:bg-red-100 p-2 rounded transition"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                >
                  🗑️
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default TimeEntryList;
