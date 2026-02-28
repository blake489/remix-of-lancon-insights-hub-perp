import { KPICard } from './KPICard';
import { ProfitMetricsTable } from './ProfitMetricsTable';
import { TrafficLight } from './TrafficLight';
import { KPIData, TrafficLightStatus } from '@/types/dashboard';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface ClaimsRevenueSummary {
  total: number;
  planned: number;
  confirmed: number;
  claimed: number;
  target: number;
}

interface MagicEquationHeaderProps {
  monthlyKPI: KPIData;
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  selectedMonth: string;
  selectedFortnight: 1 | 2;
  overheadOverride?: number;
  onOverheadChange?: (value: number) => void;
  activeGpPercent?: number;
  claimsRevenue?: ClaimsRevenueSummary;
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
  activeGpPercent,
  claimsRevenue,
}: MagicEquationHeaderProps) {
  const overheadValue = overheadOverride ?? monthlyKPI.overheads;
  const pureProfit = monthlyKPI.grossProfit - overheadValue;
  const pureProfitStatus: 'success' | 'warning' | 'danger' = pureProfit >= 0 ? 'success' : 'danger';

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue from Claims */}
        {claimsRevenue ? (
          <div className="glass-card p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(claimsRevenue.total, true)}</p>
                <p className="text-xs text-muted-foreground">Goal: {formatCurrency(claimsRevenue.target, true)}</p>
              </div>
              <TrafficLight
                status={
                  claimsRevenue.total >= claimsRevenue.target ? 'success'
                    : claimsRevenue.total >= claimsRevenue.target * 0.85 ? 'warning'
                    : 'danger'
                }
                size="md"
              />
            </div>
            <div className="mt-3 flex items-center gap-3 text-[10px] font-medium">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Claimed {formatCurrency(claimsRevenue.claimed, true)}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                Confirmed {formatCurrency(claimsRevenue.confirmed, true)}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
                Planned {formatCurrency(claimsRevenue.planned, true)}
              </span>
            </div>
          </div>
        ) : (
          <KPICard
            title="Monthly Revenue"
            value={formatCurrency(monthlyKPI.revenue, true)}
            subtitle={`of ${formatCurrency(monthlyKPI.revenueTarget, true)}`}
            status={monthlyKPI.revenueStatus}
          />
        )}
        <KPICard
          title="Monthly Gross Profit"
          value={activeGpPercent != null ? formatPercent(activeGpPercent) : formatPercent(monthlyKPI.gpPercent)}
          subtitle="Target: 18%"
          status={activeGpPercent != null ? (activeGpPercent >= 18 ? 'success' : 'danger') : monthlyKPI.gpStatus}
        />

        {/* Editable Overheads Card */}
        <div className="glass-card p-5 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly Overheads</p>
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
          title="Monthly Pure Profit"
          value={formatCurrency(pureProfit, true)}
          status={pureProfitStatus}
        />
      </div>

      {/* Profit Metrics Table replaces fortnight cards */}
      <ProfitMetricsTable
        currentFortnightKPI={currentFortnightKPI}
        previousFortnightKPI={previousFortnightKPI}
        monthlyKPI={monthlyKPI}
        overheadOverride={overheadValue}
      />
    </div>
  );
}
