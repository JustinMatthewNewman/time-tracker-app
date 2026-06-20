"use client";

import { useEffect, useState, useCallback } from "react";
import { TimeEntry, TimeEntryCreate, TimeRangeFilter } from "@/lib/schemas";
import { useAuth } from "./useAuth";

interface UseTimeEntriesState {
  entries: TimeEntry[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing time entries
 * Handles API calls and state management
 */
export function useTimeEntries() {
  const { user } = useAuth();
  const [state, setState] = useState<UseTimeEntriesState>({
    entries: [],
    loading: false,
    error: null,
  });

  /**
   * Get authorization header with Firebase token
   */
  const getAuthHeader = useCallback(async () => {
    if (!user) return null;
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [user]);

  /**
   * Fetch entries from API
   */
  const fetchEntries = useCallback(
    async (filters?: TimeRangeFilter) => {
      if (!user) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const headers = await getAuthHeader();
        if (!headers) throw new Error("Not authenticated");

        let url = "/api/entries";
        if (filters) {
          const params = new URLSearchParams();
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);
          if (filters.category) params.append("category", filters.category);
          if (filters.tags?.length) {
            filters.tags.forEach((tag) => params.append("tags", tag));
          }
          if (params.toString()) url += `?${params.toString()}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch entries");
        }

        const data = await response.json();
        setState((prev) => ({ ...prev, entries: data, loading: false }));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setState((prev) => ({ ...prev, error: message, loading: false }));
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Create a new time entry
   */
  const createEntry = useCallback(
    async (data: TimeEntryCreate) => {
      if (!user) throw new Error("Not authenticated");

      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      const response = await fetch("/api/entries", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create entry");
      }

      const newEntry = await response.json();
      setState((prev) => ({
        ...prev,
        entries: [newEntry, ...prev.entries],
      }));
      return newEntry;
    },
    [user, getAuthHeader]
  );

  /**
   * Update an existing time entry
   */
  const updateEntry = useCallback(
    async (id: string, data: Partial<TimeEntryCreate>) => {
      if (!user) throw new Error("Not authenticated");

      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      const response = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update entry");
      }

      const updatedEntry = await response.json();
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e.id === id ? updatedEntry : e)),
      }));
      return updatedEntry;
    },
    [user, getAuthHeader]
  );

  /**
   * Delete a time entry
   */
  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      const response = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete entry");
      }

      setState((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
      }));
    },
    [user, getAuthHeader]
  );

  /**
   * Get a single entry by ID
   */
  const getEntry = useCallback(
    async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const headers = await getAuthHeader();
      if (!headers) throw new Error("Not authenticated");

      const response = await fetch(`/api/entries/${id}`, { headers });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch entry");
      }

      return await response.json();
    },
    [user, getAuthHeader]
  );

  return {
    entries: state.entries,
    loading: state.loading,
    error: state.error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    getEntry,
  };
}
