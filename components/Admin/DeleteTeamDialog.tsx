"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";

interface DeleteTeamDialogProps {
  isOpen: boolean;
  teamName: string;
  memberCount: number;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

/**
 * Confirmation for deleting a team, following DeleteWorkLogDialog's shape.
 *
 * The copy is specific about what is and isn't destroyed. Deleting a *work
 * log* takes its time entries with it, so someone who has seen that dialog has
 * every reason to assume this one destroys time too — it does not. A team
 * delete drops the team and its memberships; TimeEntry has no team reference,
 * so no time data can be reached from here.
 */
export function DeleteTeamDialog({
  isOpen,
  teamName,
  memberCount,
  onClose,
  onDelete,
}: DeleteTeamDialogProps) {
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
      setError(err instanceof Error ? err.message : "Failed to delete team");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Delete team</h2>

          <p className="text-sm text-foreground/70">
            Delete <span className="font-semibold">{teamName}</span>?
            {memberCount > 0 && (
              <>
                {" "}
                Its {memberCount} {memberCount === 1 ? "membership" : "memberships"} will be removed
                too.
              </>
            )}
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            The accounts themselves and all of their time entries are untouched — only the team and
            who belongs to it are deleted. This cannot be undone.
          </p>

          {error && (
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={handleDelete} isDisabled={loading}>
              {loading ? "Deleting…" : "Delete team"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DeleteTeamDialog;
