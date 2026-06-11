import React from 'react'
import { Card } from '@heroui/react';
import ListBoxComponent from '../Utilities/ListBoxComponent';
function DashboardCardLayout() {
  return (
    <div className='flex flex-grid items-center justify-center h-screen'>

      <ListBoxComponent />

      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to Time Tracker!</h1>
        <p className='text-gray-600 mb-6'>Track your time efficiently and boost your productivity.</p>

          <Card className='p-4 mb-4  rounded-lg'>
            <h2 className='text-xl font-semibold mb-2'>Features:</h2>
            <ul className='list-disc list-inside text-gray-700'>
              <li>Easy time tracking with a user-friendly interface.</li>
              <li>Generate detailed reports to analyze your productivity.</li>
              <li>Set goals and track progress over time.</li>
            </ul>
          </Card>

          <Card className='p-4  rounded-lg'>
            <h2 className='text-xl font-semibold mb-2'>Get Started:</h2>
            <p className='text-gray-700'>Sign up now to start tracking your time and improving your productivity!</p>
          </Card>


      </Card>
    </div>
  )
}

export default DashboardCardLayout
