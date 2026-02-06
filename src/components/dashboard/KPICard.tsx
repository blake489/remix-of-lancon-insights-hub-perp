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
}

export function KPICard({
  title,
  value,
  subtitle,
  status,
  trend,
  trendValue,
  className,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={cn('glass-card p-5 transition-all duration-300 hover:shadow-lg', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {status && <TrafficLight status={status} size="md" />}
      </div>
      
      {trend && (
        <div className={cn(
          'mt-3 flex items-center gap-1.5 text-xs font-medium',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-danger',
          trend === 'flat' && 'text-muted-foreground'
        )}>
          <TrendIcon className="h-3.5 w-3.5" />
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}
