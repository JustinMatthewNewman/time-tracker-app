"use client";

import { Card, EmptyState, Skeleton } from "@heroui/react";
import { Persons } from "@gravity-ui/icons";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface TeamMemberRow {
  id: string;
  username: string;
  email: string | null;
  userType: string;
}

interface TeamRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members: TeamMemberRow[];
}

export function AdminTeamsPanel({ enabled }: { enabled: boolean }) {
  const { data, loading, error } = useAdminFetch<{ teams: TeamRow[] }>(
    "/api/admin/teams",
    enabled
  );
  const teams = data?.teams ?? [];

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <EmptyState className="p-8">
        <Persons className="size-8 text-foreground/40" />
        <p className="text-sm text-foreground/60">No teams yet.</p>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {teams.map((team) => (
        <Card key={team.id} className="p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{team.name}</h3>
              {team.description && (
                <p className="text-sm text-foreground/60">{team.description}</p>
              )}
            </div>
            <span className="shrink-0 text-xs tabular-nums text-foreground/50">
              {team.members.length} member{team.members.length === 1 ? "" : "s"}
            </span>
          </div>

          {team.members.length === 0 ? (
            <p className="mt-3 text-sm text-foreground/45">No members on this team.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Member</th>
                    <th className="border p-2 text-left">Email</th>
                    <th className="w-32 border p-2 text-left">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((m) => (
                    <tr key={m.id}>
                      <td className="border p-2">{m.username}</td>
                      <td className="border p-2 text-foreground/70">{m.email ?? "—"}</td>
                      <td className="border p-2">{m.userType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

export default AdminTeamsPanel;
