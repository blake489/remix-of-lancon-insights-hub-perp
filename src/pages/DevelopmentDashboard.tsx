import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useDevelopmentProjects, computeGroupMetrics, addLVR, type DevelopmentProjectWithLVR } from '@/hooks/useDevelopmentProjects';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { KPICard } from '@/components/dashboard/KPICard';
import { Building2, TrendingUp, TrendingDown } from 'lucide-react';

function ProjectDetail({ project }: { project: DevelopmentProjectWithLVR }) {
  const lvrStatus = project.grv_lvr > 80 ? 'danger' as const : project.grv_lvr > 60 ? 'warning' as const : 'success' as const;
  const lvrTrend = project.grv_lvr > 80 ? 'down' as const : project.grv_lvr > 60 ? 'flat' as const : 'up' as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{project.project_name}</h2>
        <span className={cn(
          'status-badge text-xs',
          lvrStatus === 'success' && 'status-badge-success',
          lvrStatus === 'warning' && 'status-badge-warning',
          lvrStatus === 'danger' && 'status-badge-danger',
        )}>
          GRV LVR {formatPercent(project.grv_lvr)}
        </span>
      </div>

      {/* Primary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Current Value"
          value={formatCurrency(Number(project.current_value), true)}
        />
        <KPICard
          title="GRV"
          value={formatCurrency(Number(project.grv), true)}
          subtitle="Gross Realised Value"
        />
        <KPICard
          title="Debt"
          value={formatCurrency(Number(project.current_loan), true)}
          status={lvrStatus}
        />
        <KPICard
          title="Cash in Offset"
          value={formatCurrency(Number(project.funds_in_offset), true)}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Debt Position</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{formatPercent(project.grv_lvr)}</p>
              <p className="text-xs text-muted-foreground mt-1">GRV LVR</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(Number(project.current_loan), true)}</p>
              <p className="text-xs text-muted-foreground mt-1">Loan</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(Number(project.current_value) - Number(project.current_loan), true)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Equity</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Returns</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(Number(project.grv), true)}</p>
              <p className="text-xs text-muted-foreground mt-1">GRV</p>
            </div>
            <div>
              <p className={cn('text-xl font-bold', Number(project.forecast_margin_on_costs) >= 0 ? 'text-success' : 'text-danger')}>
                {formatPercent(Number(project.forecast_margin_on_costs))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Forecast Margin</p>
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(Number(project.grv) - Number(project.current_value), true)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Potential Uplift</p>
            </div>
          </div>
        </div>
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

  const groupLvrStatus = group.group_current_lvr > 80 ? 'danger' as const : group.group_current_lvr > 60 ? 'warning' as const : 'success' as const;

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        {/* Header - matches main dashboard */}
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-foreground">Development Dashboard</h1>
              <span className="text-sm text-muted-foreground">{activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : activeProjects.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No active development projects. Import data via Source Data → Development Data Import.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Group KPI Cards - Primary row matching main dashboard style */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                  title="Group Current Value"
                  value={formatCurrency(group.total_current_value, true)}
                  subtitle="Total portfolio value"
                  trend="up"
                />
                <KPICard
                  title="Group GRV"
                  value={formatCurrency(group.total_grv, true)}
                  subtitle="Gross Realised Value"
                />
                <KPICard
                  title="Group GRV LVR"
                  value={formatPercent(group.group_current_lvr)}
                  subtitle={`Debt: ${formatCurrency(group.total_current_loan, true)}`}
                  status={groupLvrStatus}
                  trend={group.group_current_lvr <= 60 ? 'up' : group.group_current_lvr <= 80 ? 'flat' : 'down'}
                />
                <KPICard
                  title="Group Cash in Offset"
                  value={formatCurrency(group.total_funds_in_offset, true)}
                  subtitle="Available offset funds"
                />
              </div>

              {/* Project list + Detail - below KPI row */}
              <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[400px]">
                {/* Left list */}
                <div className="lg:col-span-1">
                  <div className="glass-card h-full">
                    <div className="p-4 border-b border-border/30">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Projects</p>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto max-h-[500px]">
                      {enriched.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          className={cn(
                            'w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200',
                            (selected?.id === p.id)
                              ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                              : 'hover:bg-muted text-foreground'
                          )}
                        >
                          <span className="block truncate">{p.project_name}</span>
                          <span className={cn(
                            'block text-xs mt-0.5',
                            selected?.id === p.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          )}>
                            {formatCurrency(Number(p.current_value), true)} · GRV LVR {formatPercent(p.grv_lvr)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right detail */}
                <div className="lg:col-span-4">
                  {selected ? (
                    <ProjectDetail project={selected} />
                  ) : (
                    <div className="glass-card p-12 text-center">
                      <p className="text-muted-foreground">Select a project to view details.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
