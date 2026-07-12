import WorkLogTimeEntryCardLayout from './WorkLogTimeEntryCardLayout';

interface WorkLogTimeEntryCardProps {
  showBreakdown?: boolean;
  onToggleBreakdown?: (showBreakdown: boolean) => void;
}

function WorkLogTimeEntryCard({ showBreakdown = false, onToggleBreakdown }: WorkLogTimeEntryCardProps) {
  return (
    <div className="h-full min-h-0 w-full flex-1 overflow-hidden text-foreground">
      <WorkLogTimeEntryCardLayout showBreakdown={showBreakdown} onToggleBreakdown={onToggleBreakdown} />
    </div>
  )
}

export default WorkLogTimeEntryCard
