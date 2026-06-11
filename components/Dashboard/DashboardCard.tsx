import { Card } from '@heroui/react'
import React from 'react'
import HomePage from './DashboardCardLayout';

function DashboardCard() {
  return (
    <div>
      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <HomePage />
      </Card>
    </div>
  )
}

export default DashboardCard
