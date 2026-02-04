import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/types/dashboard';
import { TrafficLight } from './TrafficLight';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  status?: TrafficLightStatus;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  className?: string;
  size?: 'default' | 'large';
}

export function KPICard({
  title,
  value,
  subtitle,
  status,
  trend,
  trendValue,
  className,
  size = 'default',
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'kpi-card animate-slide-in-up',
        size === 'large' && 'p-8',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className={cn('kpi-label', size === 'large' && 'text-base')}>{title}</p>
          <p className={cn('kpi-value text-foreground', size === 'large' && 'text-5xl')}>{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {status && <TrafficLight status={status} size="lg" pulse />}
      </div>
      
      {trend && trendValue && (
        <div className={cn(
          'mt-4 flex items-center gap-1.5 text-sm font-medium',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-danger',
          trend === 'flat' && 'text-muted-foreground'
        )}>
          <TrendIcon className="h-4 w-4" />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
