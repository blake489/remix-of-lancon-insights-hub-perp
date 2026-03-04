import { useState, useEffect, forwardRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIData } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProfitMetricsTableProps {
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  monthlyKPI: KPIData;
  overheadOverride: number;
  bhagTarget?: number;
  onBhagChange?: (value: number) => void;
  onBhagCommit?: (value: number) => void;
}

const fmt = (v: number) => {
  const abs = Math.abs(v);
  let formatted: string;
  if (abs >= 1_000_000) formatted = `$${(abs / 1_000_000).toFixed(2)}M`;
  else if (abs >= 1_000) formatted = `$${(abs / 1_000).toFixed(0)}K`;
  else formatted = `$${abs.toFixed(0)}`;
  return v < 0 ? `-${formatted}` : formatted;
};

const pct = (v: number) => `${v.toFixed(1)}%`;

const BhagInput = forwardRef<HTMLInputElement, {
  value: number;
  onChange?: (v: number) => void;
  onCommit?: (v: number) => void;
}>(({ value, onChange, onCommit }, ref) => {
  const [localValue, setLocalValue] = useState(String(value));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setLocalValue(String(value));
  }, [value, isEditing]);

  const commit = () => {
    const num = Math.max(0, parseInt(localValue || '0', 10) || 0);
    setLocalValue(String(num));
    onChange?.(num);
    onCommit?.(num);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="text-xs text-muted-foreground font-medium">$</span>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={localValue}
        onFocus={() => setIsEditing(true)}
        onClick={e => e.currentTarget.select()}
        onChange={e => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          setLocalValue(raw);
        }}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            (e.currentTarget as HTMLInputElement).blur();
          }
        }}
        className="w-32 h-8 text-sm font-bold tabular-nums text-right px-2 border-primary/30 focus:border-primary cursor-text"
      />
    </div>
  );
});

BhagInput.displayName = 'BhagInput';

export function ProfitMetricsTable({
  currentFortnightKPI,
  previousFortnightKPI,
  monthlyKPI,
  overheadOverride,
  bhagTarget = 1_000_000,
  onBhagChange,
  onBhagCommit,
}: ProfitMetricsTableProps) {
  const qtrMultiplier = 3;
  const annualMultiplier = 12;

  const periods = [
    {
      label: 'Last FN',
      revenue: previousFortnightKPI.revenue,
      gp: previousFortnightKPI.grossProfit,
      gpPct: previousFortnightKPI.gpPercent,
      overheads: overheadOverride / 2,
      profit: previousFortnightKPI.grossProfit - overheadOverride / 2,
      multiplierToAnnual: 24,
    },
    {
      label: 'Current FN',
      revenue: currentFortnightKPI.revenue,
      gp: currentFortnightKPI.grossProfit,
      gpPct: currentFortnightKPI.gpPercent,
      overheads: overheadOverride / 2,
      profit: currentFortnightKPI.grossProfit - overheadOverride / 2,
      multiplierToAnnual: 24,
    },
    {
      label: 'Monthly',
      revenue: monthlyKPI.revenue,
      gp: monthlyKPI.grossProfit,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride,
      profit: monthlyKPI.grossProfit - overheadOverride,
      multiplierToAnnual: 12,
    },
    {
      label: 'Quarter',
      revenue: monthlyKPI.revenue * qtrMultiplier,
      gp: monthlyKPI.grossProfit * qtrMultiplier,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride * qtrMultiplier,
      profit: (monthlyKPI.grossProfit - overheadOverride) * qtrMultiplier,
      multiplierToAnnual: 4,
    },
    {
      label: 'Annual (FY)',
      revenue: monthlyKPI.revenue * annualMultiplier,
      gp: monthlyKPI.grossProfit * annualMultiplier,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride * annualMultiplier,
      profit: (monthlyKPI.grossProfit - overheadOverride) * annualMultiplier,
      multiplierToAnnual: 1,
    },
  ];

  const rows = [
    { metric: 'Revenue', key: 'revenue' as const, colorPositive: false },
    { metric: 'Gross Profit', key: 'gp' as const, colorPositive: false },
    { metric: 'GP %', key: 'gpPct' as const, colorPositive: false, isPct: true },
    { metric: 'Overheads', key: 'overheads' as const, colorPositive: false },
    { metric: 'Pure Profit', key: 'profit' as const, colorPositive: true },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Profit Summary — Period Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="w-[140px] text-xs font-semibold">Metric</TableHead>
                {periods.map(p => (
                  <TableHead key={p.label} className="text-right text-xs font-semibold min-w-[110px]">
                    {p.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow
                  key={row.metric}
                  className={cn(
                    row.key === 'profit' && 'border-t-2 border-border bg-muted/30 font-semibold'
                  )}
                >
                  <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {row.metric}
                  </TableCell>
                  {periods.map(p => {
                    const val = p[row.key];
                    const display = row.isPct ? pct(val) : fmt(val);
                    return (
                      <TableCell
                        key={p.label}
                        className={cn(
                          'text-right tabular-nums text-sm',
                          row.colorPositive && val >= 0 && 'text-emerald-600 font-bold',
                          row.colorPositive && val < 0 && 'text-red-600 font-bold',
                        )}
                      >
                        {display}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* BHAG Target Row */}
              <TableRow className="border-t border-border/50">
                <TableCell className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    BHAG Target
                  </div>
                </TableCell>
                {periods.map(p => {
                  const periodBhag = bhagTarget / p.multiplierToAnnual;
                  if (p.label === 'Annual (FY)') {
                    return (
                      <TableCell key={p.label} className="text-right">
                        <BhagInput value={bhagTarget} onChange={onBhagChange} onCommit={onBhagCommit} />
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={p.label} className="text-right tabular-nums text-sm font-medium text-muted-foreground">
                      {fmt(periodBhag)}
                    </TableCell>
                  );
                })}
              </TableRow>

              {/* Gap to BHAG Row */}
              <TableRow className="bg-muted/20">
                <TableCell className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Gap to BHAG
                </TableCell>
                {periods.map(p => {
                  const periodBhag = bhagTarget / p.multiplierToAnnual;
                  const gap = p.profit - periodBhag;
                  return (
                    <TableCell
                      key={p.label}
                      className={cn(
                        'text-right tabular-nums text-sm font-bold',
                        gap >= 0 ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {fmt(gap)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}