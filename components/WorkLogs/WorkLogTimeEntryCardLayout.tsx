"use client";

import React from 'react'
import { Accordion } from '@heroui/react'
import { ChevronDown } from '@gravity-ui/icons'
import ListBoxComponent from '../Utilities/ListBoxComponent'
import { useTimeRange } from '../../context/TimeRangeContext'
import { formatHour } from '../TimeRangeSettings'
import { useSidebar } from "../../context/SideBarContext";
import { useSelectedWorkLog } from "../../context/SelectedWorkLogContext";
import { useTimeEntriesByWorkLog } from "@/hooks/useTimeEntriesByWorkLog";
import { WorkLogTimeEntryCardTable } from './WorkLogTimeEntryCardTable';
import TicketBreakdown from './TicketBreakdown';

interface WorkLogTimeEntryCardLayoutProps {
  showBreakdown?: boolean;
}

function WorkLogTimeEntryCardLayout({ showBreakdown = false }: WorkLogTimeEntryCardLayoutProps) {
  const { timeSlots } = useTimeRange()
  const { isOpen } = useSidebar();
  const { selectedWorkLogId } = useSelectedWorkLog();
  const { entries, loading, error, refetch } = useTimeEntriesByWorkLog(selectedWorkLogId);

  return (
    <div className='flex h-full items-stretch overflow-hidden'>
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 overflow-hidden
          ${isOpen ? "w-88" : "w-0"}
        `}
      >
        <div className="w-88 h-full bg-default-50 p-4">
          <ListBoxComponent />
        </div>
      </aside>

      <div
        className={`h-full min-w-0 flex-1 overflow-y-auto text-foreground p-4 m-4 border-l transition-colors duration-300
          ${isOpen ? "border-default-200" : "border-transparent"}`}
      >
        {/*
          Both views stay mounted at all times and are only hidden via CSS.
          Unmounting WorkLogTimeEntryCardTable on toggle would discard any in-progress
          edit sitting in its local draft state before the autosave debounce fires.
        */}
        <div className={showBreakdown ? "hidden" : ""}>
          {!selectedWorkLogId && (
            <div className="text-sm text-gray-500 p-4">
              Select a work log from the sidebar to view its time entries.
            </div>
          )}

          {selectedWorkLogId && error && (
            <div className="text-sm text-red-500 p-4">Error: {error}</div>
          )}

          {selectedWorkLogId && !error && (
            <div className='grid grid-cols-1 lg:grid-cols-1 gap-4'>
              <Accordion className="w-full">
                {timeSlots.map((hour) => {
                  const hourEntries = entries.filter(
                    (entry) => new Date(entry.startTime).getHours() === hour
                  );

                  return (
                    <Accordion.Item key={hour}>
                      <Accordion.Heading>
                        <Accordion.Trigger>
                          <span className='text-sm text-gray-500'>
                            {formatHour(hour)} – {formatHour(hour + 1)}
                          </span>
                          <Accordion.Indicator>
                            <ChevronDown />
                          </Accordion.Indicator>
                        </Accordion.Trigger>
                      </Accordion.Heading>
                      <Accordion.Panel>
                        <Accordion.Body>
                          <WorkLogTimeEntryCardTable
                            entries={hourEntries}
                            loading={loading}
                            onEntryUpdated={() => refetch()}
                          />
                        </Accordion.Body>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>

        <div className={showBreakdown ? "" : "hidden"}>
          <TicketBreakdown
            hasSelection={!!selectedWorkLogId}
            entries={entries}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkLogTimeEntryCardLayout