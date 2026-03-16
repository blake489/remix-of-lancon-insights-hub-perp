import { MagicEquationScorecard } from '@/components/dashboard/MagicEquationScorecard';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { GPBreakdownTable } from '@/components/dashboard/GPBreakdownTable';
import { ProjectHealthCard } from '@/components/dashboard/ProjectHealthCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import type { SharedDashboardProps } from '../RoleDashboard';

export function ProductionManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  return (
    <>
      <MagicEquationScorecard />
      <MonthlyRevenueChart />
      <GPBreakdownTable shared={shared} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectHealthCard shared={shared} />
        <UpcomingEventsCard shared={shared} />
      </div>
    </>
  );
}
