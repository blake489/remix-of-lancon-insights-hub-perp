import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { SiteManagerPanel } from '@/components/dashboard/SiteManagerPanel';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
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
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">LanCon Qld</h1>
                <p className="text-xs text-muted-foreground">Metrics Dashboard</p>
              </div>
            </div>
            <DashboardFilters
              selectedMonth={selectedMonth}
              selectedFortnight={selectedFortnight}
              availableMonths={availableMonths}
              onMonthChange={setSelectedMonth}
              onFortnightChange={setSelectedFortnight}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Magic Equation Header */}
        <MagicEquationHeader
          monthlyKPI={monthlyKPI}
          currentFortnightKPI={currentFortnightKPI}
          previousFortnightKPI={previousFortnightKPI}
          selectedMonth={selectedMonth}
          selectedFortnight={selectedFortnight}
        />

        {/* Projects Table */}
        <ProjectTable
          projects={projectsWithMetrics}
          siteManagers={siteManagers}
        />

        {/* Site Manager Panel */}
        <SiteManagerPanel
          activities={activities}
          projects={mockProjects}
          siteManagers={siteManagers}
          onActivityUpdate={handleActivityUpdate}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            LanCon Qld Internal Metrics Dashboard • Magic Equation: $1.65M/month @ 18% GP
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
