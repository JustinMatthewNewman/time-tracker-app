import { describe, expect, it } from "vitest";
import {
  aggregateDailyByMember,
  aggregateMembers,
  aggregateTeam,
  daysInRange,
  type MetricEntry,
  type TeamMemberInput,
} from "./adminTeamMetrics";

const alice: TeamMemberInput = { id: "u1", username: "Alice", email: "a@x.dev", userType: "Regular" };
const bob: TeamMemberInput = { id: "u2", username: "Bob", email: null, userType: "Admin" };
const carol: TeamMemberInput = { id: "u3", username: "Carol", email: null, userType: "Regular" };

function entry(
  userId: string,
  date: string,
  startHour: number,
  hours: number,
  ticketNumber?: number
): MetricEntry {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    id: `${userId}-${date}-${startHour}`,
    user: { id: userId },
    date,
    startTime: `${date}T${pad(startHour)}:00:00.000Z`,
    endTime: `${date}T${pad(startHour + hours)}:00:00.000Z`,
    ticket: ticketNumber ? { ticketNumber, ticketTitle: `T-${ticketNumber}`, color: "#abcdef" } : null,
  };
}

describe("aggregateMembers", () => {
  it("totals minutes, entries, distinct days and tickets per member", () => {
    const rows = aggregateMembers(
      [alice, bob],
      [
        entry("u1", "2026-09-01", 9, 2, 100),
        entry("u1", "2026-09-01", 13, 3, 100),
        entry("u1", "2026-09-02", 9, 1, 200),
        entry("u2", "2026-09-01", 10, 4, 300),
      ]
    );
    const a = rows.find((r) => r.id === "u1")!;
    expect(a.totalMinutes).toBe(360);
    expect(a.entryCount).toBe(3);
    expect(a.activeDays).toBe(2);
    expect(a.ticketCount).toBe(2);
    expect(a.longestEntryMinutes).toBe(180);
  });

  it("keeps roster members who logged nothing, rather than dropping them", () => {
    // An admin needs to tell "logged nothing" apart from "not on the team".
    const rows = aggregateMembers([alice, carol], [entry("u1", "2026-09-01", 9, 2, 100)]);
    expect(rows.map((r) => r.username)).toEqual(["Alice", "Carol"]);
    const c = rows.find((r) => r.id === "u3")!;
    expect(c.totalMinutes).toBe(0);
    expect(c.entryCount).toBe(0);
    expect(c.topTicket).toBeNull();
  });

  it("ignores entries from users who are not on the roster", () => {
    const rows = aggregateMembers([alice], [entry("u1", "2026-09-01", 9, 1), entry("u9", "2026-09-01", 9, 8)]);
    expect(rows).toHaveLength(1);
    expect(rows[0].totalMinutes).toBe(60);
  });

  it("sorts by time logged, descending, then by name", () => {
    const rows = aggregateMembers(
      [alice, bob, carol],
      [entry("u2", "2026-09-01", 9, 5), entry("u1", "2026-09-01", 9, 1)]
    );
    expect(rows.map((r) => r.username)).toEqual(["Bob", "Alice", "Carol"]);
  });

  it("picks the ticket with the most time as topTicket", () => {
    const rows = aggregateMembers(
      [alice],
      [
        entry("u1", "2026-09-01", 9, 1, 100),
        entry("u1", "2026-09-01", 10, 4, 200),
        entry("u1", "2026-09-02", 9, 2, 100),
      ]
    );
    expect(rows[0].topTicket).toMatchObject({ ticketNumber: 200, totalMinutes: 240 });
  });

  it("breaks topTicket ties on the lower ticket number, so results are stable", () => {
    const rows = aggregateMembers(
      [alice],
      [entry("u1", "2026-09-01", 9, 2, 500), entry("u1", "2026-09-02", 9, 2, 300)]
    );
    expect(rows[0].topTicket?.ticketNumber).toBe(300);
  });

  it("counts unticketed entries in the totals but not in ticketCount", () => {
    const rows = aggregateMembers([alice], [entry("u1", "2026-09-01", 9, 3)]);
    expect(rows[0].totalMinutes).toBe(180);
    expect(rows[0].ticketCount).toBe(0);
    expect(rows[0].topTicket).toBeNull();
  });
});

describe("aggregateTeam", () => {
  it("counts days and tickets distinctly across members, not per member", () => {
    // Alice and Bob both worked 2026-09-01 on ticket 100: one active day, one ticket.
    const team = aggregateTeam(
      [alice, bob],
      [entry("u1", "2026-09-01", 9, 2, 100), entry("u2", "2026-09-01", 9, 3, 100)]
    );
    expect(team.activeDays).toBe(1);
    expect(team.ticketCount).toBe(1);
    expect(team.totalMinutes).toBe(300);
    expect(team.entryCount).toBe(2);
  });

  it("separates active members from roster size", () => {
    const team = aggregateTeam([alice, bob, carol], [entry("u1", "2026-09-01", 9, 2)]);
    expect(team.memberCount).toBe(3);
    expect(team.activeMembers).toBe(1);
  });

  it("does not count a non-roster user's entries towards activeMembers", () => {
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 9, 1), entry("u9", "2026-09-01", 9, 1)]);
    expect(team.activeMembers).toBe(1);
    expect(team.activeMembers).toBeLessThanOrEqual(team.memberCount);
  });

  it("averages over active members only", () => {
    // 600 minutes over two active members out of a roster of three.
    const team = aggregateTeam(
      [alice, bob, carol],
      [entry("u1", "2026-09-01", 9, 4), entry("u2", "2026-09-01", 9, 6)]
    );
    expect(team.avgMinutesPerActiveMember).toBe(300);
  });

  it("returns zeroes rather than dividing by zero on an empty range", () => {
    const team = aggregateTeam([alice, bob], []);
    expect(team).toMatchObject({
      totalMinutes: 0,
      entryCount: 0,
      activeMembers: 0,
      activeDays: 0,
      ticketCount: 0,
      avgMinutesPerActiveMember: 0,
      topTicket: null,
    });
    expect(team.memberCount).toBe(2);
  });

  it("handles a team with no members at all", () => {
    expect(aggregateTeam([], [])).toMatchObject({ memberCount: 0, activeMembers: 0 });
  });

  it("reports no target when the team has not set one", () => {
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 9, 4)], {
      weeklyTargetHours: null,
      rangeDays: 7,
    });
    expect(team.targetMinutes).toBeNull();
    expect(team.attainmentPct).toBeNull();
  });

  it("compares a full week against the whole weekly target", () => {
    // 20h logged against a 40h weekly target over 7 days.
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 0, 20)], {
      weeklyTargetHours: 40,
      rangeDays: 7,
    });
    expect(team.targetMinutes).toBe(40 * 60);
    expect(team.attainmentPct).toBe(50);
  });

  it("prorates the target for a range shorter than a week", () => {
    // A single fully-worked day must not read as 14% of target.
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 0, 8)], {
      weeklyTargetHours: 70,
      rangeDays: 1,
    });
    expect(team.targetMinutes).toBe(600); // 70h / 7 days = 10h
    expect(team.attainmentPct).toBe(80);
  });

  it("prorates the target for a range longer than a week", () => {
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 0, 14)], {
      weeklyTargetHours: 40,
      rangeDays: 14,
    });
    expect(team.targetMinutes).toBe(80 * 60);
  });

  it("treats a zero target as no target rather than dividing by zero", () => {
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 9, 4)], {
      weeklyTargetHours: 0,
      rangeDays: 7,
    });
    expect(team.targetMinutes).toBeNull();
    expect(team.attainmentPct).toBeNull();
  });

  it("can report over 100% when a team beats its target", () => {
    const team = aggregateTeam([alice], [entry("u1", "2026-09-01", 0, 12)], {
      weeklyTargetHours: 70,
      rangeDays: 1,
    });
    expect(team.attainmentPct).toBe(120);
  });
});

describe("daysInRange", () => {
  it("is inclusive of both ends", () => {
    expect(daysInRange("2026-09-01", "2026-09-03")).toEqual([
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
    ]);
  });

  it("returns a single day when start equals end", () => {
    expect(daysInRange("2026-09-07", "2026-09-07")).toEqual(["2026-09-07"]);
  });

  it("crosses a month boundary", () => {
    expect(daysInRange("2026-08-30", "2026-09-02")).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
    ]);
  });
});

describe("aggregateDailyByMember", () => {
  const range = ["2026-09-01", "2026-09-03"] as const;

  it("returns every day for every member, including empty ones", () => {
    // A chart that drops quiet days compresses its x-axis and misleads.
    const daily = aggregateDailyByMember([alice, bob], [entry("u1", "2026-09-02", 9, 2, 100)], ...range);
    expect(Object.keys(daily).sort()).toEqual(["u1", "u2"]);
    expect(daily.u1.map((d) => d.date)).toEqual(["2026-09-01", "2026-09-02", "2026-09-03"]);
    expect(daily.u2.every((d) => d.totalMinutes === 0 && d.segments.length === 0)).toBe(true);
  });

  it("sums a ticket's entries within a day into one segment", () => {
    const daily = aggregateDailyByMember(
      [alice],
      [entry("u1", "2026-09-01", 9, 2, 100), entry("u1", "2026-09-01", 13, 1, 100)],
      ...range
    );
    const day = daily.u1[0];
    expect(day.segments).toHaveLength(1);
    expect(day.segments[0]).toMatchObject({ ticketNumber: 100, minutes: 180 });
    expect(day.totalMinutes).toBe(180);
  });

  it("keeps separate tickets as separate segments, largest first", () => {
    const daily = aggregateDailyByMember(
      [alice],
      [
        entry("u1", "2026-09-01", 9, 1, 100),
        entry("u1", "2026-09-01", 10, 3, 200),
        entry("u1", "2026-09-01", 14, 2, 300),
      ],
      ...range
    );
    expect(daily.u1[0].segments.map((s) => s.ticketNumber)).toEqual([200, 300, 100]);
    expect(daily.u1[0].totalMinutes).toBe(360);
  });

  it("buckets unticketed time into its own segment", () => {
    const daily = aggregateDailyByMember(
      [alice],
      [entry("u1", "2026-09-01", 9, 2), entry("u1", "2026-09-01", 11, 1, 100)],
      ...range
    );
    const seg = daily.u1[0].segments.find((s) => s.ticketNumber === null);
    expect(seg?.minutes).toBe(120);
  });

  it("splits the same ticket across different days", () => {
    const daily = aggregateDailyByMember(
      [alice],
      [entry("u1", "2026-09-01", 9, 2, 100), entry("u1", "2026-09-03", 9, 1, 100)],
      ...range
    );
    expect(daily.u1.map((d) => d.totalMinutes)).toEqual([120, 0, 60]);
  });

  it("truncates timestamp dates to a day key", () => {
    // TimeEntry.date is a Timestamp, so it arrives as a full ISO string.
    const e = entry("u1", "2026-09-02", 9, 1, 100);
    e.date = "2026-09-02T00:00:00.000Z";
    const daily = aggregateDailyByMember([alice], [e], ...range);
    expect(daily.u1[1].totalMinutes).toBe(60);
  });

  it("ignores entries from users outside the roster", () => {
    const daily = aggregateDailyByMember([alice], [entry("u9", "2026-09-01", 9, 8, 100)], ...range);
    expect(daily.u9).toBeUndefined();
    expect(daily.u1.every((d) => d.totalMinutes === 0)).toBe(true);
  });

  it("carries the day's work log id, for the chart's day axis", () => {
    const a = entry("u1", "2026-09-01", 9, 2, 100);
    const b = entry("u1", "2026-09-01", 13, 1, 200);
    a.workLog = { id: "wl-1" };
    b.workLog = { id: "wl-1" };
    const daily = aggregateDailyByMember([alice], [a, b], ...range);
    expect(daily.u1[0].workLogId).toBe("wl-1");
  });

  it("leaves the work log id null on an empty day", () => {
    const daily = aggregateDailyByMember([alice], [], ...range);
    expect(daily.u1.every((d) => d.workLogId === null)).toBe(true);
  });

  it("leaves it null when entries carry no work log", () => {
    const daily = aggregateDailyByMember([alice], [entry("u1", "2026-09-01", 9, 2, 100)], ...range);
    expect(daily.u1[0].workLogId).toBeNull();
  });
});
