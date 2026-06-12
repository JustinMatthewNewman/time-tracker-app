import { Card } from '@heroui/react'
import DashboardCardLayout from './DashboardCardLayout';

function DashboardCard() {
  return (
    <div>
      <div className='h-full w-screen text-foreground p-4 m-4'>
        <DashboardCardLayout />
      </div>
    </div>
  )
}

export default DashboardCard
