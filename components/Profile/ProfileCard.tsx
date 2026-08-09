"use client";

import { Avatar, Card, Chip, ProgressBar, Skeleton } from '@heroui/react'
import { useAuth } from "@/hooks/useAuth";
import ProfileAuthSection from './ProfileAuthSection';
import { useMyTimeEntries, type MyTimeEntry } from '@/hooks/useMyTimeEntries';
import { useMemo } from 'react';
import { minutesBetween } from '@/lib/timeTotals';
import { startOfWeek } from '@/lib/weekBuckets';
import { ListCheck, ClockFill, ChartLineArrowUp, Flame, Medal } from '@gravity-ui/icons';

// No per-user goal setting exists yet, so this is a fixed default until that
// preference ships.
const WEEKLY_GOAL_HOURS = 40;

// Milestone thresholds for the achievements section, checked high to low.
const HOUR_MILESTONES = [1000, 500, 100, 25, 10];
const ENTRY_MILESTONE = 100;

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Consecutive logged calendar days, walking back from today. Today itself
// doesn't break the streak until it's over — an entry just hasn't been
// logged yet — so the walk starts from yesterday when today has nothing.
function calculateStreakDays(entries: MyTimeEntry[]): number {
  const loggedDays = new Set(entries.map((e) => localDateKey(new Date(e.startTime))));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!loggedDays.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (loggedDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateThisWeekMinutes(entries: MyTimeEntry[]): number {
  const weekStart = startOfWeek(new Date());
  return entries
    .filter((e) => new Date(e.startTime) >= weekStart)
    .reduce((sum, entry) => sum + minutesBetween(entry.startTime, entry.endTime), 0);
}

function ProfileCard() {
  const { user, loading } = useAuth();
  const { entries, loading: entriesLoading } = useMyTimeEntries();

  const stats = useMemo(() => {
    const totalMinutes = entries.reduce((sum, entry) => sum + minutesBetween(entry.startTime, entry.endTime), 0);
    return {
      totalEntries: entries.length,
      totalHours: parseFloat((totalMinutes / 60).toFixed(2)),
      thisWeek: parseFloat((calculateThisWeekMinutes(entries) / 60).toFixed(2)),
      streakDays: calculateStreakDays(entries),
    };
  }, [entries]);

  const achievements = useMemo(() => {
    const list: { label: string; icon: typeof Flame; color: "warning" | "success" | "accent" }[] = [];
    if (stats.streakDays >= 2) {
      list.push({ label: `${stats.streakDays}-day streak`, icon: Flame, color: "warning" });
    }
    const milestone = HOUR_MILESTONES.find((m) => stats.totalHours >= m);
    if (milestone) {
      list.push({ label: `${milestone}+ hours logged`, icon: ClockFill, color: "success" });
    }
    if (stats.totalEntries >= ENTRY_MILESTONE) {
      list.push({ label: `${stats.totalEntries}+ entries logged`, icon: Medal, color: "accent" });
    }
    return list;
  }, [stats]);

  const initials = (user?.displayName ?? user?.email ?? "U")[0].toUpperCase();

  const statCards = [
    { label: "Total Entries", value: stats.totalEntries, icon: ListCheck, color: "text-blue-600 dark:text-blue-400" },
    { label: "Total Hours", value: `${stats.totalHours}h`, icon: ClockFill, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "This Week", value: `${stats.thisWeek}h`, icon: ChartLineArrowUp, color: "text-purple-600 dark:text-purple-400" },
    { label: "Day Streak", value: stats.streakDays, icon: Flame, color: "text-orange-600 dark:text-orange-400" },
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
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Stats */}
      {!loading && user && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {entriesLoading
            ? statCards.map(({ label }) => (
                <Card key={label} variant="secondary" className="gap-2">
                  <Skeleton className="size-5 rounded" />
                  <Skeleton className="h-7 w-12 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </Card>
              ))
            : statCards.map(({ label, value, icon: Icon, color }) => (
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
          {entriesLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ) : (
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
          )}
        </Card>
      )}

      {/* Achievements */}
      {!loading && user && (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Achievements</h2>
          {entriesLoading ? (
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-40 rounded-full" />
            </div>
          ) : achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {achievements.map(({ label, icon: Icon, color }) => (
                <Chip key={label} color={color} variant="soft" size="lg">
                  <Icon className="size-3.5" />
                  <Chip.Label>{label}</Chip.Label>
                </Chip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/60">Log time to start earning achievements.</p>
          )}
        </Card>
      )}

      {/* Account info + preferences */}
      <ProfileAuthSection user={user} loading={loading} />
    </div>
  )
}

export default ProfileCard
