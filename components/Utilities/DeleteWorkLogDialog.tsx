"use client";

import { useState } from "react";
import { Card } from "@heroui/react";

interface DeleteWorkLogDialogProps {
  isOpen: boolean;
  workLogName: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export function DeleteWorkLogDialog({ isOpen, workLogName, onClose, onDelete }: DeleteWorkLogDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete work log");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Delete Work Log</h2>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{workLogName}</span>?
            This will also delete all of its time entries. This cannot be undone.
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-6">
            <button
              type="button"
              className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DeleteWorkLogDialog;
