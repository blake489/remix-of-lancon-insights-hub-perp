import React from 'react';
import { MagicEquationHeader } from '@/components/dashboard/MagicEquationHeader';
import { MagicEquationScorecard } from '@/components/dashboard/MagicEquationScorecard';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { GPBreakdownTable } from '@/components/dashboard/GPBreakdownTable';
import { ProjectHealthCard } from '@/components/dashboard/ProjectHealthCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { QuickLinksCard } from '@/components/dashboard/QuickLinksCard';
import type { SharedDashboardProps } from '../RoleDashboard';

export function DirectorDashboard({ shared }: { shared: SharedDashboardProps }) {
  return (
    <>
      <MagicEquationHeader
        monthlyKPI={shared.monthlyKPI}
        currentFortnightKPI={shared.currentFortnightKPI}
        previousFortnightKPI={shared.previousFortnightKPI}
        selectedMonth={shared.selectedMonth}
        selectedFortnight={shared.selectedFortnight}
        overheadOverride={shared.overheadOverride}
        onOverheadChange={shared.onOverheadChange}
        activeGpPercent={shared.activeGpPercent?.percent}
        activeGpContractCount={shared.activeGpPercent?.count}
        claimsRevenue={shared.claimsRevenue}
        adjacentMonthProfits={shared.adjacentMonthProfits}
        lastMonthOverhead={shared.lastMonthOverhead}
        nextMonthOverhead={shared.nextMonthOverhead}
        onLastMonthOverheadChange={shared.onLastMonthOverheadChange}
        onNextMonthOverheadChange={shared.onNextMonthOverheadChange}
        bhagTarget={shared.bhagTarget}
        onBhagChange={shared.onBhagChange}
        onBhagCommit={shared.onBhagCommit}
      />
      <MagicEquationScorecard />
      <MonthlyRevenueChart />
      <GPBreakdownTable shared={shared} />
      <div className="grid gap-6 lg:grid-cols-3">
        <ProjectHealthCard shared={shared} />
        <UpcomingEventsCard shared={shared} />
        <QuickLinksCard navigate={shared.navigate} />
      </div>
    </>
  );
}
