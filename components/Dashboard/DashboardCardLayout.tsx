"use client";

import React from 'react'
import { Card, Accordion, TextArea, Input } from '@heroui/react'
import { ChevronDown } from '@gravity-ui/icons'
import ListBoxComponent from '../Utilities/ListBoxComponent'
import { useTimeRange } from '../../context/TimeRangeContext'
import { formatHour } from '../TimeRangeSettings'
import { useSidebar } from "../../context/SideBarContext";
import { useSelectedWorkLog } from "../../context/SelectedWorkLogContext";
import { useTimeEntriesByWorkLog } from "@/hooks/useTimeEntriesByWorkLog";
import { DashboardCardTable } from './DashboardCardTable';
 
 
function DashboardCardLayout() {
  const { timeSlots } = useTimeRange()
  const { isOpen } = useSidebar();
  const { selectedWorkLogId } = useSelectedWorkLog();
  const { entries, loading, error, refetch } = useTimeEntriesByWorkLog(selectedWorkLogId);

  return (
    <div className='flex flex-grid items-center justify-center h-screen'>
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 overflow-hidden
          ${isOpen ? "w-88" : "w-0"}
        `}
      >
        <div className="w-88 h-screen bg-default-50 p-4">
          <ListBoxComponent />
        </div>
      </aside>

      <div
        className={`h-full w-screen text-foreground p-4 m-4 border-l transition-colors duration-300 
          ${isOpen ? "border-default-200" : "border-transparent"}`}
      >
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
                        <DashboardCardTable
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
    </div>
  )
}

export default DashboardCardLayout