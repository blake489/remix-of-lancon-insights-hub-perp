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
import { TrendingUp } from 'lucide-react';

interface ProfitMetricsTableProps {
  currentFortnightKPI: KPIData;
  previousFortnightKPI: KPIData;
  monthlyKPI: KPIData;
  overheadOverride: number;
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

export function ProfitMetricsTable({
  currentFortnightKPI,
  previousFortnightKPI,
  monthlyKPI,
  overheadOverride,
}: ProfitMetricsTableProps) {
  // Derive period data
  // Quarterly = 3× monthly, Annual = 12× monthly (annualised run-rate)
  const qtrMultiplier = 3;
  const annualMultiplier = 12;

  const periods = [
    {
      label: 'Last FN',
      revenue: previousFortnightKPI.revenue,
      gp: previousFortnightKPI.grossProfit,
      gpPct: previousFortnightKPI.gpPercent,
      overheads: overheadOverride / 2, // half-month
      profit: previousFortnightKPI.grossProfit - overheadOverride / 2,
    },
    {
      label: 'Current FN',
      revenue: currentFortnightKPI.revenue,
      gp: currentFortnightKPI.grossProfit,
      gpPct: currentFortnightKPI.gpPercent,
      overheads: overheadOverride / 2,
      profit: currentFortnightKPI.grossProfit - overheadOverride / 2,
    },
    {
      label: 'Monthly',
      revenue: monthlyKPI.revenue,
      gp: monthlyKPI.grossProfit,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride,
      profit: monthlyKPI.grossProfit - overheadOverride,
    },
    {
      label: 'Quarter',
      revenue: monthlyKPI.revenue * qtrMultiplier,
      gp: monthlyKPI.grossProfit * qtrMultiplier,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride * qtrMultiplier,
      profit: (monthlyKPI.grossProfit - overheadOverride) * qtrMultiplier,
    },
    {
      label: 'Annual (FY)',
      revenue: monthlyKPI.revenue * annualMultiplier,
      gp: monthlyKPI.grossProfit * annualMultiplier,
      gpPct: monthlyKPI.gpPercent,
      overheads: overheadOverride * annualMultiplier,
      profit: (monthlyKPI.grossProfit - overheadOverride) * annualMultiplier,
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
                          row.key === 'profit' && 'text-sm',
                        )}
                      >
                        {display}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
