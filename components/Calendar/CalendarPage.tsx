"use client";

import FeatureGate from "@/components/FeatureGate";
import AmbientBackground from "@/components/AmbientBackground";
import { Card } from "@heroui/react";
import { CalendarReport } from "@/components/Dashboard/CalendarReport";

// Standalone page for the calendar, promoted out of the dashboard's report
// submenu into the top-level nav.
//
// CalendarReport itself is unchanged and still lives under components/Dashboard —
// it was never coupled to the report shell (it renders its own month selector
// and card), so moving it would have been churn for no gain.
//
// Still gated on the Dashboard feature. Leaving the page it used to live
// inside does not change who should be able to reach it, and silently
// widening access as a side effect of a navigation change is the wrong
// default — even though this reads only the caller's own data through
// USER-level queries scoped by auth.uid, so there is no privilege here to
// escalate either way.
export function CalendarPage() {
  return (
    <FeatureGate feature="Dashboard" label="the calendar">
      <div className="relative flex h-full flex-col overflow-hidden p-4 sm:p-6">
        <AmbientBackground intensity={0.85} />
        <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col">
          <Card className="flex h-full min-h-0 flex-1 flex-col overflow-hidden p-4">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CalendarReport />
            </div>
          </Card>
        </div>
      </div>
    </FeatureGate>
  );
}

export default CalendarPage;
