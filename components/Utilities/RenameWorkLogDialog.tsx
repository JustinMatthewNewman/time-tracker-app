"use client";

import { useState } from "react";
import { Card } from "@heroui/react";

interface RenameWorkLogDialogProps {
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
}

export function RenameWorkLogDialog({ isOpen, initialName, onClose, onRename }: RenameWorkLogDialogProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form fields whenever the dialog transitions from closed to open,
  // without an effect (see https://react.dev/learn/you-might-not-need-an-effect).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setName(initialName);
      setError(null);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onRename(name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename work log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Rename Work Log</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold block mb-2">Title *</label>
              <input
                type="text"
                placeholder="What is this work log for?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-default-200 rounded-lg"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                className="flex-1 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !name.trim()}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default RenameWorkLogDialog;
