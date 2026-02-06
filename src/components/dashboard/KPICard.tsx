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
        'kpi-card group',
        size === 'large' && 'p-8',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className={cn('kpi-label', size === 'large' && 'text-xs')}>{title}</p>
          <p className={cn(
            'kpi-value text-foreground transition-transform duration-300 group-hover:scale-[1.02]', 
            size === 'large' && 'text-5xl'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
          )}
        </div>
        {status && (
          <div className="animate-float">
            <TrafficLight status={status} size="lg" pulse />
          </div>
        )}
      </div>
      
      {trend && trendValue && (
        <div className={cn(
          'mt-5 flex items-center gap-2 text-sm font-semibold transition-all duration-300',
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
