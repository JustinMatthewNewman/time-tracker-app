import WorkLogTimeEntryCardLayout from './WorkLogTimeEntryCardLayout';

interface WorkLogTimeEntryCardProps {
  showBreakdown?: boolean;
}

function WorkLogTimeEntryCard({ showBreakdown = false }: WorkLogTimeEntryCardProps) {
  return (
    <div className="h-full min-h-0 w-full flex-1 overflow-hidden text-foreground">
      <WorkLogTimeEntryCardLayout showBreakdown={showBreakdown} />
    </div>
  )
}

export default WorkLogTimeEntryCard
