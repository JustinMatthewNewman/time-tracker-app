"use client";

import { Avatar, Card, Chip, ProgressBar, Tooltip, Button } from '@heroui/react'
import { useAuth } from "@/hooks/useAuth";
import ProfileAuthSection from './ProfileAuthSection';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useMemo } from 'react';
import type { TimeEntry } from '@/lib/schemas';
import { ListCheck, ClockFill, ChartLineArrowUp, Flame, PersonPencil } from '@gravity-ui/icons';

// Weekly hour target used for the goal meter. No per-user goal setting exists
// yet, so this is a fixed placeholder until that preference ships.
const WEEKLY_GOAL_HOURS = 40;

// Streak tracking doesn't exist yet — mocked so the achievements section has
// something to show. Replace once daily-activity tracking is built.
const MOCK_STREAK_DAYS = 4;
const MOCK_ACHIEVEMENTS = [
  { label: "4-day streak", icon: Flame, color: "warning" as const },
  { label: "100+ hours logged", icon: ClockFill, color: "success" as const },
  { label: "Early adopter", icon: PersonPencil, color: "accent" as const },
];

function calculateThisWeekHours(entries: TimeEntry[]) {
  const now = new Date();
  const weekStart = new Date(new Date(now).setDate(now.getDate() - now.getDay()));
  const weekHours = entries
    .filter((e) => new Date(e.startTime) >= weekStart)
    .reduce((sum, entry) => sum + entry.duration, 0) / 60;
  return parseFloat(weekHours.toFixed(2));
}

function ProfileCard() {
  const { user, loading } = useAuth();
  const { entries } = useTimeEntries();

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { totalEntries: 0, totalHours: 0, thisWeek: 0 };
    }
    const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
    return {
      totalEntries: entries.length,
      totalHours: parseFloat(totalHours.toFixed(2)),
      thisWeek: calculateThisWeekHours(entries),
    };
  }, [entries]);

  const initials = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  const statCards = [
    { label: "Total Entries", value: stats.totalEntries, icon: ListCheck, color: "text-blue-600 dark:text-blue-400" },
    { label: "Total Hours", value: `${stats.totalHours}h`, icon: ClockFill, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "This Week", value: `${stats.thisWeek}h`, icon: ChartLineArrowUp, color: "text-purple-600 dark:text-purple-400" },
    { label: "Day Streak", value: MOCK_STREAK_DAYS, icon: Flame, color: "text-orange-600 dark:text-orange-400" },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Hero */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="h-24 bg-gradient-to-r from-accent via-purple-500 to-blue-500 sm:h-28" />
        <Card.Content className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar size="lg" className="size-24 border-4 border-background shadow-lg">
                {user?.photoURL ? (
                  <Avatar.Image src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" />
                ) : null}
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="text-2xl font-bold">{user?.displayName ?? "User"}</h1>
                <p className="text-sm text-foreground/60">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-1">
              <Chip color={user?.emailVerified ? "success" : "warning"} variant="soft">
                <Chip.Label>{user?.emailVerified ? "Verified" : "Unverified"}</Chip.Label>
              </Chip>
              {user?.providerData?.[0]?.providerId === "google.com" && (
                <Chip color="accent" variant="soft">
                  <Chip.Label>Google</Chip.Label>
                </Chip>
              )}
              <Tooltip>
                <Tooltip.Trigger>
                  <Button variant="outline" size="sm">
                    <PersonPencil /> Edit profile
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Coming soon</Tooltip.Content>
              </Tooltip>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Stats */}
      {!loading && user && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} variant="secondary" className="gap-2">
              <Icon className={`size-5 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs uppercase tracking-wider text-foreground/60">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Weekly goal */}
      {!loading && user && (
        <Card className="p-6">
          <ProgressBar
            value={Math.min(stats.thisWeek, WEEKLY_GOAL_HOURS)}
            minValue={0}
            maxValue={WEEKLY_GOAL_HOURS}
          >
            <span data-slot="label">Weekly goal</span>
            <ProgressBar.Output>{`${stats.thisWeek}h / ${WEEKLY_GOAL_HOURS}h`}</ProgressBar.Output>
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card>
      )}

      {/* Achievements (mocked) */}
      {!loading && user && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {MOCK_ACHIEVEMENTS.map(({ label, icon: Icon, color }) => (
              <Chip key={label} color={color} variant="soft" size="lg">
                <Icon className="size-3.5" />
                <Chip.Label>{label}</Chip.Label>
              </Chip>
            ))}
          </div>
        </Card>
      )}

      {/* Account info + preferences */}
      <ProfileAuthSection user={user} loading={loading} />
    </div>
  )
}

export default ProfileCard
