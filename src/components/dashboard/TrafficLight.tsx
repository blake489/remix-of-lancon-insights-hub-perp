import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/types/dashboard';

interface TrafficLightProps {
  status: TrafficLightStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3.5 h-3.5',
  lg: 'w-5 h-5',
};

export function TrafficLight({ status, size = 'md', pulse = false, className }: TrafficLightProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        sizeClasses[size],
        status === 'success' && 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]',
        status === 'warning' && 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.5)]',
        status === 'danger' && 'bg-danger shadow-[0_0_8px_hsl(var(--danger)/0.5)]',
        pulse && 'animate-pulse-glow',
        className
      )}
    />
  );
}
