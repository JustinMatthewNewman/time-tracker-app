"use client";

import { useState } from "react";
import { EmptyState, ListBox, Select, Skeleton } from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { useFeatures } from "@/hooks/useFeatures";
import { useListUserTypes } from "@/src/dataconnect-generated/react";

interface AdminUserRow {
  id: string;
  username: string;
  email: string | null;
  userType: string;
  createdAt: string;
}

export function AdminUsersPanel({ enabled }: { enabled: boolean }) {
  const { user } = useAuth();
  const { features, userId: myUserId } = useFeatures();
  const { data, loading, error, refetch } = useAdminFetch<{ users: AdminUserRow[] }>(
    "/api/admin/users",
    enabled
  );
  // ListUserTypes is USER-level (the tier names are non-sensitive), so the
  // picker's options come straight from Data Connect rather than another
  // admin round trip.
  const userTypesQuery = useListUserTypes({ enabled });

  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const users = data?.users ?? [];
  const canEdit = features.has("UserTypeControl");
  const tierNames = (userTypesQuery.data?.userTypes ?? []).map((t) => t.name);

  const changeTier = async (targetId: string, userTypeName: string) => {
    if (!user) return;
    setSavingId(targetId);
    setSaveError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ userTypeName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      // Refetch rather than patching local state: the server is the authority
      // on what actually landed, and a rejected change must not leave the row
      // showing the tier the user picked.
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update user type");
    } finally {
      setSavingId(null);
    }
  };

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState className="p-8">
        <p className="text-sm text-foreground/60">No users found.</p>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {saveError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-left">User</th>
              <th className="border p-2 text-left">Email</th>
              <th className="w-44 border p-2 text-left">Tier</th>
              <th className="w-40 border p-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              // The API refuses self-edits to prevent an admin locking
              // themselves (and possibly everyone) out; disabling the control
              // here just surfaces that rule before the round trip.
              const isSelf = !!myUserId && u.id === myUserId;
              return (
                <tr key={u.id}>
                  <td className="border p-2">{u.username}</td>
                  <td className="border p-2 text-foreground/70">{u.email ?? "—"}</td>
                  <td className="border p-2">
                    {canEdit && tierNames.length > 0 ? (
                      <Select
                        selectedKey={u.userType}
                        onSelectionChange={(key) => changeTier(u.id, String(key))}
                        isDisabled={savingId === u.id || isSelf}
                        aria-label={`Tier for ${u.username}`}
                      >
                        <Select.Trigger className="h-8 w-full text-sm">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {tierNames.map((name) => (
                              <ListBox.Item key={name} id={name} textValue={name}>
                                {name}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    ) : (
                      u.userType
                    )}
                  </td>
                  <td className="border p-2 whitespace-nowrap text-foreground/70">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPanel;
