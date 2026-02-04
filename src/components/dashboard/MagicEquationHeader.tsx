import { KPICard } from './KPICard';
import { StatusBadge } from './StatusBadge';
import { KPIData } from '@/types/dashboard';
import { formatCurrency, formatPercent, getMonthName } from '@/lib/formatters';
import { Target, TrendingUp, Building2, Wallet } from 'lucide-react';

interface MagicEquationHeaderProps {
  monthlyKPI: KPIData;
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  selectedMonth: string;
  selectedFortnight: 1 | 2;
}

function getEquationSummary(kpi: KPIData): { text: string; status: 'success' | 'warning' | 'danger' } {
  const revenueRatio = kpi.revenue / kpi.revenueTarget;
  const gpOnTrack = kpi.gpPercent >= 16;
  
  if (revenueRatio >= 1 && gpOnTrack && kpi.pureProfit >= 0) {
    return { text: 'Ahead of magic equation', status: 'success' };
  }
  if (revenueRatio >= 0.85 && kpi.gpPercent >= 14 && kpi.pureProfit >= -20000) {
    return { text: 'On track for magic equation', status: 'warning' };
  }
  return { text: 'Behind magic equation', status: 'danger' };
}

export function MagicEquationHeader({
  monthlyKPI,
  currentFortnightKPI,
  previousFortnightKPI,
  selectedMonth,
  selectedFortnight,
}: MagicEquationHeaderProps) {
  const summary = getEquationSummary(monthlyKPI);
  
  return (
    <div className="space-y-6">
      {/* Header with title and status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Magic Equation Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            {getMonthName(selectedMonth)} • Fortnight {selectedFortnight}
          </p>
        </div>
        <StatusBadge 
          status={summary.status} 
          label={summary.text}
          className="self-start text-sm px-4 py-2"
        />
      </div>

      {/* Monthly KPIs - Primary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(monthlyKPI.revenue, true)}
          subtitle={`Target: ${formatCurrency(monthlyKPI.revenueTarget, true)}`}
          status={monthlyKPI.revenueStatus}
          trend={monthlyKPI.revenue >= monthlyKPI.revenueTarget ? 'up' : 'down'}
          trendValue={`${((monthlyKPI.revenue / monthlyKPI.revenueTarget) * 100).toFixed(0)}% of target`}
          size="large"
        />
        <KPICard
          title="Gross Profit"
          value={formatCurrency(monthlyKPI.grossProfit, true)}
          subtitle={`GP: ${formatPercent(monthlyKPI.gpPercent)} (Target: 18%)`}
          status={monthlyKPI.gpStatus}
          trend={monthlyKPI.gpPercent >= 18 ? 'up' : monthlyKPI.gpPercent >= 16 ? 'flat' : 'down'}
          trendValue={`${monthlyKPI.gpPercent >= 18 ? '+' : ''}${(monthlyKPI.gpPercent - 18).toFixed(1)}pp vs target`}
          size="large"
        />
        <KPICard
          title="Overheads"
          value={formatCurrency(monthlyKPI.overheads, true)}
          subtitle="10.5% of revenue"
          size="large"
        />
        <KPICard
          title="Pure Profit"
          value={formatCurrency(monthlyKPI.pureProfit, true)}
          subtitle="GP minus overheads"
          status={monthlyKPI.pureProfitStatus}
          trend={monthlyKPI.pureProfit >= 0 ? 'up' : 'down'}
          trendValue={monthlyKPI.pureProfit >= 0 ? 'Profitable' : 'Loss'}
          size="large"
        />
      </div>

      {/* Fortnight KPIs - Secondary metrics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Current Fortnight ({selectedFortnight === 1 ? '1-14' : '15-End'})</h3>
            <StatusBadge 
              status={currentFortnightKPI.revenueStatus} 
              label={formatCurrency(currentFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(currentFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPercent(currentFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">GP %</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${currentFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(currentFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pure Profit</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Previous Fortnight</h3>
            <StatusBadge 
              status={previousFortnightKPI.revenueStatus} 
              label={formatCurrency(previousFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(previousFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPercent(previousFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">GP %</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${previousFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(previousFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pure Profit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
