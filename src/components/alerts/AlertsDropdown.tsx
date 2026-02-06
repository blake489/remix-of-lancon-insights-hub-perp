import { useNavigate } from 'react-router-dom';
import { Bell, CloudRain, X, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAlerts } from '@/hooks/useAlerts';
import { Alert } from '@/types/alerts';
import { cn } from '@/lib/utils';

const severityStyles = {
  info: 'border-l-primary bg-primary/5',
  warning: 'border-l-warning bg-warning/5',
  critical: 'border-l-destructive bg-destructive/5',
};

const severityBadgeStyles = {
  info: 'bg-primary/10 text-primary border-primary/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

function AlertIcon({ type }: { type: Alert['type'] }) {
  switch (type) {
    case 'weather':
      return <CloudRain className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

function AlertItem({
  alert,
  onMarkRead,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  onMarkRead: () => void;
  onDismiss: () => void;
  onAction?: () => void;
}) {
  return (
    <div
      className={cn(
        'border-l-4 p-3 rounded-r-lg transition-colors',
        severityStyles[alert.severity],
        !alert.read && 'ring-1 ring-inset ring-border/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 p-1.5 rounded-md', severityBadgeStyles[alert.severity])}>
          <AlertIcon type={alert.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-sm font-medium', !alert.read && 'text-foreground')}>
              {alert.title}
            </span>
            {!alert.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {alert.message}
          </p>
          {alert.actionUrl && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 mt-2 text-xs"
              onClick={onAction}
            >
              {alert.actionLabel || 'View'} <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {!alert.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMarkRead}
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onDismiss}
            title="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AlertsDropdown() {
  const navigate = useNavigate();
  const { alerts, loading, unreadCount, markAsRead, markAllAsRead, dismissAlert } = useAlerts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Alerts</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No alerts</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {alerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={() => markAsRead(alert.id)}
                  onDismiss={() => dismissAlert(alert.id)}
                  onAction={() => alert.actionUrl && navigate(alert.actionUrl)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
