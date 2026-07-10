interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="rounded-lg border border-default-200 bg-default-50 p-4">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

export default StatTile;
