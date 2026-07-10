import { Card } from '@heroui/react'
import DashboardCardLayout from './DashboardCardLayout';

interface DashboardCardProps {
  showBreakdown?: boolean;
}

function DashboardCard({ showBreakdown = false }: DashboardCardProps) {
  return (
    <div>
      <div className='h-full w-screen text-foreground p-4 m-4'>
        <DashboardCardLayout showBreakdown={showBreakdown} />
      </div>
    </div>
  )
}

export default DashboardCard
