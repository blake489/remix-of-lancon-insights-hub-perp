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
    <div className="space-y-8">
      {/* Header with title and status */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl tracking-tight">
            Magic Equation Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            {getMonthName(selectedMonth)} • Fortnight {selectedFortnight}
          </p>
        </div>
        <StatusBadge 
          status={summary.status} 
          label={summary.text}
          className="self-start text-sm px-5 py-2.5"
        />
      </div>

      {/* Monthly KPIs - Primary metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="opacity-0 animate-scale-in stagger-1">
          <KPICard
            title="Monthly Revenue"
            value={formatCurrency(monthlyKPI.revenue, true)}
            subtitle={`Target: ${formatCurrency(monthlyKPI.revenueTarget, true)}`}
            status={monthlyKPI.revenueStatus}
            trend={monthlyKPI.revenue >= monthlyKPI.revenueTarget ? 'up' : 'down'}
            trendValue={`${((monthlyKPI.revenue / monthlyKPI.revenueTarget) * 100).toFixed(0)}% of target`}
            size="large"
          />
        </div>
        <div className="opacity-0 animate-scale-in stagger-2">
          <KPICard
            title="Gross Profit"
            value={formatCurrency(monthlyKPI.grossProfit, true)}
            subtitle={`GP: ${formatPercent(monthlyKPI.gpPercent)} (Target: 18%)`}
            status={monthlyKPI.gpStatus}
            trend={monthlyKPI.gpPercent >= 18 ? 'up' : monthlyKPI.gpPercent >= 16 ? 'flat' : 'down'}
            trendValue={`${monthlyKPI.gpPercent >= 18 ? '+' : ''}${(monthlyKPI.gpPercent - 18).toFixed(1)}pp vs target`}
            size="large"
          />
        </div>
        <div className="opacity-0 animate-scale-in stagger-3">
          <KPICard
            title="Overheads"
            value={formatCurrency(monthlyKPI.overheads, true)}
            subtitle="Fixed: 10.5% of $1.65M target"
            size="large"
          />
        </div>
        <div className="opacity-0 animate-scale-in stagger-4">
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
      </div>

      {/* Fortnight KPIs - Secondary metrics */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-card p-6 opacity-0 animate-scale-in stagger-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">Current Fortnight ({selectedFortnight === 1 ? '1-14' : '15-End'})</h3>
            <StatusBadge 
              status={currentFortnightKPI.revenueStatus} 
              label={formatCurrency(currentFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(currentFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Revenue</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight">{formatPercent(currentFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">GP %</p>
            </div>
            <div className="space-y-1">
              <p className={`text-3xl font-bold tracking-tight ${currentFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(currentFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Pure Profit</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 opacity-0 animate-scale-in stagger-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-foreground text-lg">Previous Fortnight</h3>
            <StatusBadge 
              status={previousFortnightKPI.revenueStatus} 
              label={formatCurrency(previousFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight">{formatCurrency(previousFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Revenue</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight">{formatPercent(previousFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">GP %</p>
            </div>
            <div className="space-y-1">
              <p className={`text-3xl font-bold tracking-tight ${previousFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(previousFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Pure Profit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
