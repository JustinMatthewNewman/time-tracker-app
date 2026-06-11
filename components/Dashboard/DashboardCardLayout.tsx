import React from 'react'
import { Card } from '@heroui/react'
import ListBoxComponent from '../Utilities/ListBoxComponent'
import TimeRangeSettings from '../TimeRangeSettings'
import { useTimeRange } from '../../context/TimeRangeContext'
import { formatHour } from '../TimeRangeSettings'

function DashboardCardLayout() {
  const { timeSlots } = useTimeRange()

  return (
    <div className='flex flex-grid items-center justify-center h-screen'>
      <ListBoxComponent />

      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to Time Tracker!</h1>
        <p className='text-gray-600 mb-6'>Track your time efficiently and boost your productivity.</p>



        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {timeSlots.map((hour, idx) => (
            <Card key={hour} className='p-4 rounded-lg bg-red-100'>
              <h2 className='text-xl font-semibold mb-1'>Hour {idx + 1}</h2>
              <p className='text-sm text-gray-500 mb-2'>
                {formatHour(hour)} – {formatHour(hour + 1)}
              </p>
              <p className='text-gray-700'>Available</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default DashboardCardLayout