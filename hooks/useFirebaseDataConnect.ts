"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  useListTimeEntries,
  useCreateTimeEntry,
  useUpdateTimeEntryClearTicket,
  useDeleteTimeEntry,
} from "@/src/dataconnect-generated/react";
import {
  ListTimeEntriesVariables,
  CreateTimeEntryVariables,
  UpdateTimeEntryClearTicketVariables,
  DeleteTimeEntryVariables,
} from "@/src/dataconnect-generated";

export interface TimeEntryData {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  description?: string | null;
  ticket?: { ticketNumber: number; ticketLink?: string | null } | null;
  officeNumber?: string | null;
  createdAt: string;
}

export function useFirebaseDataConnect() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query hook for listing entries
  const listQuery = useListTimeEntries(
    { userId: (user?.uid || "") as any },
    { enabled: !!user?.uid }
  );

  // Mutation hooks
  const createMutation = useCreateTimeEntry();
  const updateMutation = useUpdateTimeEntryClearTicket();
  const deleteMutation = useDeleteTimeEntry();

  // Sync query data to state
  useEffect(() => {
    if (listQuery.data?.timeEntries) {
      const timeEntries = listQuery.data.timeEntries.map((entry: any) => ({
        id: entry.id,
        startTime: entry.startTime,
        endTime: entry.endTime,
        date: entry.date,
        description: entry.description || "",
        ticket: entry.ticket ?? null,
        officeNumber: entry.officeNumber || "",
        createdAt: entry.createdAt,
      }));
      setEntries(timeEntries);
    }
    
    setLoading(listQuery.isPending);
    setError(listQuery.error?.message || null);
  }, [listQuery.data, listQuery.isPending, listQuery.error]);

  // Create a new time entry
  const createEntry = useCallback(
    async (data: {
      startTime: string;
      endTime: string;
      date: string;
      description?: string;
      officeNumber?: string;
    }) => {
      if (!user?.uid) throw new Error("Not authenticated");

      try {
        const now = new Date().toISOString();

        const result = await createMutation.mutateAsync({
          userId: user.uid as any,
          startTime: data.startTime,
          endTime: data.endTime,
          date: data.date,
          createdAt: now,
          description: data.description || undefined,
          officeNumber: data.officeNumber || undefined,
        } as CreateTimeEntryVariables);

        // Refetch to get the new entry
        await listQuery.refetch();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create entry";
        setError(message);
        throw new Error(message);
      }
    },
    [user?.uid, createMutation, listQuery]
  );

  // Update an existing time entry's description/office number. Ticket
  // assignment goes through UpsertTicket + UpdateTimeEntry (see
  // WorkLogTimeEntryCardTable), so this always clears any existing ticket.
  const updateEntry = useCallback(
    async (
      entryId: string,
      data: {
        description?: string;
        officeNumber?: string;
      }
    ) => {
      if (!user?.uid) throw new Error("Not authenticated");

      try {
        const result = await updateMutation.mutateAsync({
          entryId: entryId as any,
          description: data.description || undefined,
          officeNumber: data.officeNumber || undefined,
        } as UpdateTimeEntryClearTicketVariables);

        // Refetch to get updated entry
        await listQuery.refetch();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update entry";
        setError(message);
        throw new Error(message);
      }
    },
    [user?.uid, updateMutation, listQuery]
  );

  // Delete a time entry
  const deleteEntry = useCallback(
    async (entryId: string) => {
      if (!user?.uid) throw new Error("Not authenticated");

      try {
        const result = await deleteMutation.mutateAsync({
          entryId: entryId as any,
        } as DeleteTimeEntryVariables);

        // Refetch to update list
        await listQuery.refetch();
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete entry";
        setError(message);
        throw new Error(message);
      }
    },
    [user?.uid, deleteMutation, listQuery]
  );

  return {
    entries,
    loading,
    error,
    fetchEntries: listQuery.refetch,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
