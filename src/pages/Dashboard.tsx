import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { SiteManagerPanel } from '@/components/dashboard/SiteManagerPanel';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
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
    <DashboardLayout>
      <div className="min-h-full gradient-mesh">
        {/* Page Header with Filters */}
        <div className="border-b border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Monitor your project metrics and KPIs</p>
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
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
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
        <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm py-6">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-center text-sm text-muted-foreground font-medium">
              LanCon Qld Internal Metrics Dashboard • Magic Equation: $1.65M/month @ 18% GP
            </p>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
