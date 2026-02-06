import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { SiteManagerPanel } from '@/components/dashboard/SiteManagerPanel';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { UserMenu } from '@/components/auth/UserMenu';
import {
  getProjectsWithMetrics,
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
  mockProjects,
  mockSiteManagerActivities,
  siteManagers,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';
import { SiteManagerActivity } from '@/types/dashboard';
import { Building2 } from 'lucide-react';

const availableMonths = [
  '2025-02',
  '2025-01',
  '2024-12',
  '2024-11',
];

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight, setSelectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const [activities, setActivities] = useState(mockSiteManagerActivities);

  const projectsWithMetrics = getProjectsWithMetrics();
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();

  const handleActivityUpdate = (activityId: string, field: keyof SiteManagerActivity, value: boolean | number) => {
    setActivities(prev => 
      prev.map(a => 
        a.id === activityId ? { ...a, [field]: value } : a
      )
    );
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Top Navigation Bar */}
      <header className="glass-header">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">LanCon Qld</h1>
                <p className="text-xs text-muted-foreground font-medium">Metrics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DashboardFilters
                selectedMonth={selectedMonth}
                selectedFortnight={selectedFortnight}
                availableMonths={availableMonths}
                onMonthChange={setSelectedMonth}
                onFortnightChange={setSelectedFortnight}
              />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 section-spacing">
        {/* Magic Equation Header */}
        <div className="animate-fade-in">
          <MagicEquationHeader
            monthlyKPI={monthlyKPI}
            currentFortnightKPI={currentFortnightKPI}
            previousFortnightKPI={previousFortnightKPI}
            selectedMonth={selectedMonth}
            selectedFortnight={selectedFortnight}
          />
        </div>

        {/* Projects Table */}
        <div className="animate-slide-in-up stagger-2">
          <ProjectTable
            projects={projectsWithMetrics}
            siteManagers={siteManagers}
          />
        </div>

        {/* Site Manager Panel */}
        <div className="animate-slide-in-up stagger-3">
          <SiteManagerPanel
            activities={activities}
            projects={mockProjects}
            siteManagers={siteManagers}
            onActivityUpdate={handleActivityUpdate}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <p className="text-center text-sm text-muted-foreground font-medium">
            LanCon Qld Internal Metrics Dashboard • Magic Equation: $1.65M/month @ 18% GP
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
