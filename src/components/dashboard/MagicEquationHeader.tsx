import { KPICard } from './KPICard';
import { StatusBadge } from './StatusBadge';
import { KPIData } from '@/types/dashboard';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MagicEquationHeaderProps {
  monthlyKPI: KPIData;
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  selectedMonth: string;
  selectedFortnight: 1 | 2;
  overheadOverride?: number;
  onOverheadChange?: (value: number) => void;
}

const OVERHEAD_STEP = 5000;

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
  overheadOverride,
  onOverheadChange,
}: MagicEquationHeaderProps) {
  const overheadValue = overheadOverride ?? monthlyKPI.overheads;
  const pureProfit = monthlyKPI.grossProfit - overheadValue;
  const pureProfitStatus: 'success' | 'warning' | 'danger' = pureProfit >= 0 ? 'success' : 'danger';

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Revenue"
          value={formatCurrency(monthlyKPI.revenue, true)}
          subtitle={`of ${formatCurrency(monthlyKPI.revenueTarget, true)}`}
          status={monthlyKPI.revenueStatus}
        />
        <KPICard
          title="Gross Profit"
          value={formatPercent(monthlyKPI.gpPercent)}
          subtitle="Target: 18%"
          status={monthlyKPI.gpStatus}
        />

        {/* Editable Overheads Card */}
        <div className="glass-card p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overheads</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(overheadValue, true)}</p>
              <p className="text-xs text-muted-foreground">Fixed monthly</p>
            </div>
            {onOverheadChange && (
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onOverheadChange(overheadValue + OVERHEAD_STEP)}
                  className="h-7 w-7 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
                  title={`Increase by $${(OVERHEAD_STEP / 1000).toFixed(0)}K`}
                >
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => onOverheadChange(Math.max(0, overheadValue - OVERHEAD_STEP))}
                  className="h-7 w-7 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
                  title={`Decrease by $${(OVERHEAD_STEP / 1000).toFixed(0)}K`}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>

        <KPICard
          title="Pure Profit"
          value={formatCurrency(pureProfit, true)}
          status={pureProfitStatus}
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
