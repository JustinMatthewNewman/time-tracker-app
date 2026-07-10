"use client";

import React, { useState } from "react";
import { Button, Input, Card } from "@heroui/react";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeEntryCreate } from "@/lib/schemas";

interface TimeEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Development",
  "Design",
  "Testing",
  "Documentation",
  "Meeting",
  "Break",
  "Other",
];

/**
 * Form component for creating new time entries
 */
export function TimeEntryForm({ isOpen, onClose, onSuccess }: TimeEntryFormProps) {
  const { createEntry, error: apiError } = useTimeEntries();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TimeEntryCreate>({
    title: "",
    description: "",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    category: "Development",
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Convert datetime-local to ISO string
      const startTime = new Date(formData.startTime).toISOString();
      const endTime = new Date(formData.endTime).toISOString();

      if (new Date(endTime) <= new Date(startTime)) {
        setError("End time must be after start time");
        setLoading(false);
        return;
      }

      await createEntry({
        ...formData,
        startTime,
        endTime,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        category: "Development",
        tags: [],
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">New Time Entry</h2>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {(error || apiError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error || apiError}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold block mb-2">Title *</label>
              <input
                type="text"
                placeholder="What did you work on?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Description</label>
              <textarea
                placeholder="Add details about this task (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-default-200 rounded-lg"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-default-200 rounded-lg"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                onClick={() => onClose()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                onClick={(e) => handleSubmit(e)}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Entry"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default TimeEntryForm;
