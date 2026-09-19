import { ChartLine, Ticket, ClockFill, PersonGear } from "@gravity-ui/icons";
import type { FeatureName } from "@/lib/features";

// "calendar" was removed when the calendar moved to its own top-level
// route (app/calendar) — it is no longer one of the dashboard reports.
// "admin" came the other way: it was the standalone /admin/dashboard page
// before moving in here as a gated report.
export type ReportId = "overview" | "tickets" | "worklogs" | "admin";

export interface ReportDef {
  id: ReportId;
  label: string;
  description: string;
  icon: typeof ChartLine;
  /**
   * Grant required to see this report at all. Reports without one are open to
   * anyone who can reach the dashboard.
   */
  feature?: FeatureName;
}

export const REPORTS: ReportDef[] = [
  { id: "overview", label: "Overview", description: "Weekly trends & totals", icon: ChartLine },
  { id: "tickets", label: "Tickets", description: "Breakdown by ticket", icon: Ticket },
  { id: "worklogs", label: "Work Logs", description: "Breakdown by work log", icon: ClockFill },
  // Last, and gated: this one shows other people's hours, unlike every report
  // above it, which only ever shows the signed-in user their own.
  {
    id: "admin",
    label: "Admin",
    description: "Team and per-member totals",
    icon: PersonGear,
    feature: "AdminDashboard",
  },
];
