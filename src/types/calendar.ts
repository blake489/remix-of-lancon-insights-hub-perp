export type CalendarEventType = 
  | 'fortnight-start'
  | 'fortnight-end'
  | 'pc-date'
  | 'contract-completion'
  | 'revised-completion'
  | 'claim-deadline'
  | 'eot-deadline'
  | 'project-start'
  | 'claim-projected'
  | 'claim-confirmed'
  | 'claim-claimed'
  | 'variation-due'
  | 'rain-eot'
  | 'public-holiday'
  | 'new-business';

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: CalendarEventType;
  projectId?: string;
  projectName?: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EventsByDate {
  [dateKey: string]: CalendarEvent[];
}
