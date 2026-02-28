import { KPICard } from './KPICard';
import { StatusBadge } from './StatusBadge';
import { KPIData } from '@/types/dashboard';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';

interface MagicEquationHeaderProps {
  monthlyKPI: KPIData;
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  selectedMonth: string;
  selectedFortnight: 1 | 2;
}

function getEquationSummary(kpi: KPIData): { text: string; status: 'success' | 'warning' | 'danger' } {
  const revenueRatio = kpi.revenue / kpi.revenueTarget;
  const gpOnTrack = kpi.gpPercent >= DEFAULT_GP_THRESHOLDS.green;
  
  if (revenueRatio >= 1 && gpOnTrack && kpi.pureProfit >= 0) {
    return { text: 'On Track', status: 'success' };
  }
  if (revenueRatio >= 0.85 && kpi.gpPercent >= 14 && kpi.pureProfit >= -20000) {
    return { text: 'Monitor', status: 'warning' };
  }
  return { text: 'Action Required', status: 'danger' };
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
      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue"
          value={formatCurrency(monthlyKPI.revenue, true)}
          subtitle={`of ${formatCurrency(monthlyKPI.revenueTarget, true)}`}
          status={monthlyKPI.revenueStatus}
          trend={monthlyKPI.revenue >= monthlyKPI.revenueTarget ? 'up' : 'down'}
          trendValue={`${((monthlyKPI.revenue / monthlyKPI.revenueTarget) * 100).toFixed(0)}%`}
        />
        <KPICard
          title="Gross Profit"
          value={formatPercent(monthlyKPI.gpPercent)}
          subtitle="Target: 18%"
          status={monthlyKPI.gpStatus}
          trend={monthlyKPI.gpPercent >= 18 ? 'up' : monthlyKPI.gpPercent >= DEFAULT_GP_THRESHOLDS.green ? 'flat' : 'down'}
        />
        <KPICard
          title="Overheads"
          value={formatCurrency(monthlyKPI.overheads, true)}
          subtitle="Fixed monthly"
        />
        <KPICard
          title="Pure Profit"
          value={formatCurrency(monthlyKPI.pureProfit, true)}
          status={monthlyKPI.pureProfitStatus}
          trend={monthlyKPI.pureProfit >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Fortnight Comparison - Compact */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Current FN{selectedFortnight}
            </span>
            <StatusBadge 
              status={currentFortnightKPI.revenueStatus} 
              label={formatCurrency(currentFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(currentFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground mt-1">Revenue</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatPercent(currentFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground mt-1">GP</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${currentFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(currentFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Profit</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Previous Fortnight
            </span>
            <StatusBadge 
              status={previousFortnightKPI.revenueStatus} 
              label={formatCurrency(previousFortnightKPI.revenue, true)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(previousFortnightKPI.revenue, true)}</p>
              <p className="text-xs text-muted-foreground mt-1">Revenue</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatPercent(previousFortnightKPI.gpPercent)}</p>
              <p className="text-xs text-muted-foreground mt-1">GP</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${previousFortnightKPI.pureProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(previousFortnightKPI.pureProfit, true)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Profit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
