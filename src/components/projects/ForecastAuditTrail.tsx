import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { History, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ForecastAuditRow {
  id: string;
  old_forecast_cost: number;
  new_forecast_cost: number;
  old_contract_value: number;
  new_contract_value: number;
  old_gross_profit: number;
  new_gross_profit: number;
  old_gp_percent: number;
  new_gp_percent: number;
  changed_at: string;
  reason: string | null;
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export function ForecastAuditTrail({ projectId }: { projectId: string }) {
  const { data: history = [] } = useQuery({
    queryKey: ['forecast-audit', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_forecast_audit')
        .select('*')
        .eq('project_id', projectId)
        .order('changed_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as ForecastAuditRow[];
    },
  });

  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Forecast Change History
        </span>
        <Badge variant="secondary" className="text-[10px]">{history.length}</Badge>
      </div>
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
        {history.map((row) => {
          const costChanged = row.old_forecast_cost !== row.new_forecast_cost;
          const contractChanged = row.old_contract_value !== row.new_contract_value;
          return (
            <div key={row.id} className="flex items-center gap-3 text-xs border rounded-md px-3 py-2 bg-muted/20">
              <span className="text-muted-foreground tabular-nums shrink-0">
                {format(new Date(row.changed_at), 'dd MMM yy HH:mm')}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {costChanged && (
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">{fmt(row.old_forecast_cost)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">{fmt(row.new_forecast_cost)}</span>
                  </span>
                )}
                {contractChanged && (
                  <span className="flex items-center gap-1">
                    <span className="text-muted-foreground">Contract:</span>
                    <span className="font-medium">{fmt(row.old_contract_value)}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-semibold">{fmt(row.new_contract_value)}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">GP:</span>
                  <span className={cn("font-semibold", row.new_gp_percent >= 16 ? "text-emerald-600" : row.new_gp_percent >= 12 ? "text-amber-600" : "text-red-600")}>
                    {row.new_gp_percent.toFixed(1)}%
                  </span>
                </span>
              </div>
              {row.reason && (
                <span className="text-muted-foreground italic ml-1">— {row.reason}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
