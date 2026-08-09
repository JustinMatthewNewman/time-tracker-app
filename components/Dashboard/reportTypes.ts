import { ChartLine, Ticket, ClockFill } from "@gravity-ui/icons";

export type ReportId = "overview" | "tickets" | "worklogs";

export interface ReportDef {
  id: ReportId;
  label: string;
  description: string;
  icon: typeof ChartLine;
}

export const REPORTS: ReportDef[] = [
  { id: "overview", label: "Overview", description: "Weekly trends & totals", icon: ChartLine },
  { id: "tickets", label: "Tickets", description: "Breakdown by ticket", icon: Ticket },
  { id: "worklogs", label: "Work Logs", description: "Breakdown by work log", icon: ClockFill },
];
