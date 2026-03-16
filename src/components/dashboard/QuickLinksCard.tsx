import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText, Receipt, Landmark, Users, Calendar, CloudSun, ArrowRight, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickLinks = [
  { title: 'Projects', description: 'Contracts & portfolio', icon: FileText, url: '/projects', color: 'text-blue-500' },
  { title: 'Claims Papi', description: 'Claim schedules', icon: Receipt, url: '/claims', color: 'text-emerald-500' },
  { title: 'Development', description: 'Property tracking', icon: Landmark, url: '/development', color: 'text-violet-500' },
  { title: 'Team', description: 'Staff & org chart', icon: Users, url: '/team', color: 'text-rose-500' },
  { title: 'Calendar', description: 'Events & deadlines', icon: Calendar, url: '/calendar', color: 'text-cyan-500' },
  { title: 'Weather', description: 'Site forecasts', icon: CloudSun, url: '/weather', color: 'text-orange-500' },
];

export function QuickLinksCard({ navigate }: { navigate: (path: string) => void }) {
  return (
    <Card className="border-border/50 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {quickLinks.map((link) => (
            <button
              key={link.url}
              onClick={() => navigate(link.url)}
              className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-muted/60 transition-colors text-left group"
            >
              <link.icon className={cn('h-4 w-4 shrink-0', link.color)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{link.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{link.description}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
