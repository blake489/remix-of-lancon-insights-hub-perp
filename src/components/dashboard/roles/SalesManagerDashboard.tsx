import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SharedDashboardProps } from '../RoleDashboard';

const QUOTE_TARGET = 4_000_000;
const GP_SIGN_TARGET = 180_000;

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export function SalesManagerDashboard({ shared }: { shared: SharedDashboardProps }) {
  const claimsTotal = shared.claimsRevenue?.total ?? 0;

  return (
    <>
      {/* Sales KPI targets */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Monthly Quote Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{fmt(QUOTE_TARGET)}</p>
            <p className="text-xs text-muted-foreground mt-1">Quotes issued per month target</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Monthly GP Sign Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{fmt(GP_SIGN_TARGET)}</p>
            <p className="text-xs text-muted-foreground mt-1">Contracts signed worth this GP/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart — sales pipeline converts to revenue */}
      <MonthlyRevenueChart />

      {/* Revenue summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Revenue Pipeline — Current Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{fmt(shared.claimsRevenue?.planned ?? 0)}</p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Planned</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{fmt(shared.claimsRevenue?.confirmed ?? 0)}</p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Confirmed</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{fmt(shared.claimsRevenue?.claimed ?? 0)}</p>
              <p className="text-[10px] uppercase text-muted-foreground tracking-wide">Claimed</p>
            </div>
          </div>
          <div className="mt-4 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                claimsTotal >= (shared.claimsRevenue?.target ?? 1) ? 'bg-emerald-500' : 'bg-amber-500',
              )}
              style={{ width: `${Math.min(100, (claimsTotal / (shared.claimsRevenue?.target ?? 1)) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            {fmt(claimsTotal)} of {fmt(shared.claimsRevenue?.target ?? 0)} target
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingEventsCard shared={shared} />
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <button onClick={() => shared.navigate('/sales')} className="text-xs text-primary hover:underline">
              View full sales pipeline →
            </button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
