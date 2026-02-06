export type AlertType = 'weather' | 'project' | 'deadline' | 'system';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface WeatherAlert extends Alert {
  type: 'weather';
  metadata: {
    date: string;
    rainChance: number;
    rainAmount: number;
  };
}
