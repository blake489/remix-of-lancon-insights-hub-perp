import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/types/dashboard';
import { TrafficLight } from './TrafficLight';

interface StatusBadgeProps {
  status: TrafficLightStatus;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'status-badge',
        status === 'success' && 'status-badge-success',
        status === 'warning' && 'status-badge-warning',
        status === 'danger' && 'status-badge-danger',
        className
      )}
    >
      <TrafficLight status={status} size="sm" />
      {label}
    </span>
  );
}
