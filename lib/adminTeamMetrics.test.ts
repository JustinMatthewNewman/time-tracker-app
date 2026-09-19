import { describe, expect, it } from "vitest";
import {
  aggregateMembers,
  aggregateTeam,
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
});
