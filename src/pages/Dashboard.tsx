import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  FileText, 
  Receipt, 
  Landmark, 
  Users, 
  Calendar, 
  CloudSun,
  ArrowRight,
} from 'lucide-react';

const quickLinks = [
  { title: 'Magic Equation', description: 'Revenue, GP%, overheads & pure profit', icon: Sparkles, url: '/magic', color: 'text-amber-500' },
  { title: 'Projects', description: 'Building contracts & portfolio', icon: FileText, url: '/projects', color: 'text-blue-500' },
  { title: 'Claims Papi', description: 'Claim schedules & management', icon: Receipt, url: '/claims', color: 'text-emerald-500' },
  { title: 'Development', description: 'Development project tracking', icon: Landmark, url: '/development', color: 'text-violet-500' },
  { title: 'Team', description: 'Staff directory & org chart', icon: Users, url: '/team', color: 'text-rose-500' },
  { title: 'Calendar', description: 'Events, deadlines & reminders', icon: Calendar, url: '/calendar', color: 'text-cyan-500' },
  { title: 'Weather', description: 'Site conditions & forecasts', icon: CloudSun, url: '/weather', color: 'text-orange-500' },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <TodayWidget variant="inline" />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link) => (
              <Card 
                key={link.url} 
                className="group cursor-pointer border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                onClick={() => navigate(link.url)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                      <span className="text-sm font-semibold">{link.title}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
