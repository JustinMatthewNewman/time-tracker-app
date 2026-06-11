import React from 'react'
import { Card } from '@heroui/react';

function HomePage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <Card>
        <h1 className='text-2xl font-bold mb-4'>Welcome to Time Tracker!</h1>
        <p className='text-gray-600 mb-6'>Track your time efficiently and boost your productivity.</p>

      </Card>

    </div>
  )
}

export default HomePage
