import { useState } from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  getProjectsWithMetrics,
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
  siteManagers,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';

const availableMonths = [
  '2025-02',
  '2025-01',
  '2024-12',
  '2024-11',
];

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight, setSelectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const projectsWithMetrics = getProjectsWithMetrics();
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        {/* Minimal Header */}
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
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
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-10">
            {/* Today Widget + KPI Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-1">
                <TodayWidget />
              </div>
              <div className="lg:col-span-4">
                <MagicEquationHeader
                  monthlyKPI={monthlyKPI}
                  currentFortnightKPI={currentFortnightKPI}
                  previousFortnightKPI={previousFortnightKPI}
                  selectedMonth={selectedMonth}
                  selectedFortnight={selectedFortnight}
                />
              </div>
            </div>

            {/* Projects Table */}
            <section>
              <ProjectTable
                projects={projectsWithMetrics}
                siteManagers={siteManagers}
              />
            </section>

          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
