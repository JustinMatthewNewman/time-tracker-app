import React from 'react'
import { Card, Accordion, TextArea, Input } from '@heroui/react'
import { ChevronDown } from '@gravity-ui/icons'
import ListBoxComponent from '../Utilities/ListBoxComponent'
import { useTimeRange } from '../../context/TimeRangeContext'
import { formatHour } from '../TimeRangeSettings'
import { useSidebar } from "../../context/SideBarContext";
import { DashboardCardTable } from './DashboardCardTable';

function formatQuarterHour(hour: number, quarter: number): string {
  const totalMinutes = hour * 60 + quarter * 15
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`
}

const QUARTERS = [0, 1, 2, 3]

function DashboardCardLayout() {
  const { timeSlots } = useTimeRange()
  const { isOpen } = useSidebar();

  return (
    <div className='flex flex-grid items-center justify-center h-screen'>
      {/* Sidebar */}
      <aside
        className={`
          transition-all duration-300 overflow-hidden 
          ${isOpen ? "w-72" : "w-0"}
        `}
      >
        <div className="w-72 h-screen bg-default-50 p-4">
          <ListBoxComponent />
        </div>
      </aside>

      <div className='h-full w-screen text-foreground p-4 m-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4'>
          <Accordion className="w-full">
            {timeSlots.map((hour, idx) => (
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
                    <DashboardCardTable />
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

export default DashboardCardLayout