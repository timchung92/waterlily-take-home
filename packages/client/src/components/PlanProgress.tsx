
interface PlanProgressProps {
  className?: string;
  client: Client;
}

export function PlanProgress({ className, client }: PlanProgressProps) {
  return (
    <span className={className}>
      { Math.floor(client.planProgressPercent * 100) }%
    </span>
  );
}