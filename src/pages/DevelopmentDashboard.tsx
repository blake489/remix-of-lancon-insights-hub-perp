import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useDevelopmentProjects, computeGroupMetrics, addLVR, type DevelopmentProjectWithLVR } from '@/hooks/useDevelopmentProjects';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}

function ProjectDetail({ project }: { project: DevelopmentProjectWithLVR }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">{project.project_name}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Current Value" value={formatCurrency(Number(project.current_value))} />
        <MetricCard label="Current Loan" value={formatCurrency(Number(project.current_loan))} />
        <MetricCard label="Funds in Offset" value={formatCurrency(Number(project.funds_in_offset))} />
        <MetricCard label="GRV" value={formatCurrency(Number(project.grv))} />
        <MetricCard label="Current LVR" value={formatPercent(project.current_lvr)} />
        <MetricCard label="Forecast Margin on Costs" value={formatPercent(Number(project.forecast_margin_on_costs))} />
      </div>
    </div>
  );
}

export default function DevelopmentDashboard() {
  const { data: projects, isLoading } = useDevelopmentProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeProjects = (projects || []).filter(p => p.is_active);
  const group = computeGroupMetrics(activeProjects);
  const enriched = activeProjects.map(addLVR);
  const selected = enriched.find(p => p.id === selectedId) || enriched[0] || null;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        {/* Page header */}
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <h1 className="text-xl font-semibold text-foreground">Development Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Group overview of active development projects</p>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : activeProjects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No active development projects. Import data via Source Data → Development Data Import.</p>
            </div>
          ) : (
            <>
              {/* Group summary */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Group Summary</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <MetricCard label="Group Current Value" value={formatCurrency(group.total_current_value)} />
                  <MetricCard label="Group Current Loan" value={formatCurrency(group.total_current_loan)} />
                  <MetricCard label="Group Funds in Offset" value={formatCurrency(group.total_funds_in_offset)} />
                  <MetricCard label="Group GRV" value={formatCurrency(group.total_grv)} />
                  <MetricCard label="Group Current LVR" value={formatPercent(group.group_current_lvr)} />
                  <MetricCard label="Group Forecast Margin" value={formatPercent(group.total_forecast_margin_on_costs)} />
                </div>
              </section>

              {/* Project list + detail */}
              <section className="flex gap-6 min-h-[400px]">
                {/* Left list */}
                <div className="w-64 shrink-0">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Projects</h3>
                  <div className="space-y-1 overflow-y-auto max-h-[600px]">
                    {enriched.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-lg text-sm transition-colors',
                          (selected?.id === p.id)
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        {p.project_name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right detail */}
                <div className="flex-1 min-w-0">
                  {selected ? (
                    <ProjectDetail project={selected} />
                  ) : (
                    <p className="text-muted-foreground">Select a project to view details.</p>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
