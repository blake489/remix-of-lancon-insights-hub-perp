import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { TodayWidget } from '@/components/dashboard/TodayWidget';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import { useMessages } from '@/hooks/useMessages';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useKPISettings } from '@/hooks/useKPISettings';
import { useClaims } from '@/hooks/useClaims';
import { useToast } from '@/hooks/use-toast';
import { useUserRole, getRoleLabel } from '@/hooks/useUserRole';
import { GpThresholds, DEFAULT_GP_THRESHOLDS } from '@/lib/gpThresholds';
import {
  getCurrentKPIData,
  getFortnight1KPIData,
  getPreviousFortnightKPIData,
} from '@/data/mockData';
import { getCurrentMonth, getCurrentFortnight } from '@/lib/formatters';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isAfter, parseISO, addMonths, subMonths } from 'date-fns';
import { Mail } from 'lucide-react';
import { RoleDashboard } from '@/components/dashboard/RoleDashboard';

const OWN_JOBS = ['28 durimbil st', '117a tranters ave'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, isLoading: projLoading } = useProjects();
  const { data: kpi } = useKPISettings();
  const { claims } = useClaims();
  const { unreadCount } = useMessages();
  const roleInfo = useUserRole();

  const now = new Date();
  const nextMonth = addDays(now, 30);
  const { events, isLoading: eventsLoading } = useCalendarEvents(now, nextMonth);

  const [selectedMonth] = useState(getCurrentMonth());
  const [selectedFortnight] = useState<1 | 2>(getCurrentFortnight());
  const monthlyKPI = getCurrentKPIData();
  const currentFortnightKPI = getFortnight1KPIData();
  const previousFortnightKPI = getPreviousFortnightKPIData();
  const [overheadOverride, setOverheadOverride] = useState<number>(monthlyKPI.overheads);
  const [lastMonthOverhead, setLastMonthOverhead] = useState<number>(monthlyKPI.overheads);
  const [nextMonthOverhead, setNextMonthOverhead] = useState<number>(monthlyKPI.overheads);
  const [bhagTarget, setBhagTarget] = useState<number>(1_000_000);
  const [bhagLoaded, setBhagLoaded] = useState(false);
  const { toast } = useToast();

  const t: GpThresholds = kpi ? { green: kpi.gp_threshold_green, orange: kpi.gp_threshold_orange } : DEFAULT_GP_THRESHOLDS;
  const revenueTarget = kpi?.monthly_revenue_target ?? 1650000;

  useEffect(() => {
    if (!bhagLoaded && kpi?.bhag_target != null) {
      setBhagTarget(kpi.bhag_target);
      setBhagLoaded(true);
    }
  }, [kpi?.bhag_target, bhagLoaded]);

  const handleBhagChange = (value: number) => setBhagTarget(value);

  const handleBhagCommit = async (value: number) => {
    setBhagTarget(value);
    if (!kpi?.id) return;
    const { error } = await supabase
      .from('kpi_settings')
      .update({ bhag_target: value })
      .eq('id', kpi.id);
    if (error) {
      setBhagTarget(kpi.bhag_target);
      toast({ title: 'Unable to save BHAG target', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const claimsRevenue = useMemo(() => {
    const monthClaims = claims.filter(c => c.month_key === currentMonthKey);
    const planned = monthClaims.filter(c => c.status === 'planned').reduce((s, c) => s + Math.abs(c.amount), 0);
    const confirmed = monthClaims.filter(c => c.status === 'confirmed').reduce((s, c) => s + Math.abs(c.amount), 0);
    const claimed = monthClaims.filter(c => c.status === 'claimed').reduce((s, c) => s + Math.abs(c.amount), 0);
    return { total: planned + confirmed + claimed, planned, confirmed, claimed, target: revenueTarget };
  }, [claims, currentMonthKey, revenueTarget]);

  const activeGpPercent = useMemo(() => {
    const active = projects.filter(p => p.status === 'Active' && !OWN_JOBS.includes(p.job_name.toLowerCase()) && (p.category === 'pre_construction' || p.category === 'construction'));
    const totalContract = active.reduce((s, p) => s + (p.contract_value_ex_gst || 0), 0);
    const totalProfit = active.reduce((s, p) => s + (p.forecast_gross_profit || 0), 0);
    return { percent: totalContract > 0 ? (totalProfit / totalContract) * 100 : 0, count: active.length };
  }, [projects]);

  const adjacentMonthProfits = useMemo(() => {
    const now = new Date();
    const lastMonthKey = format(subMonths(now, 1), 'yyyy-MM');
    const nextMonthKey = format(addMonths(now, 1), 'yyyy-MM');
    const gpRate = (activeGpPercent?.percent ?? 0) / 100;
    const getRevenue = (mk: string) => claims.filter(c => c.month_key === mk).reduce((s, c) => s + Math.abs(c.amount), 0);
    return {
      lastMonth: { label: format(subMonths(now, 1), 'MMM yyyy'), pureProfit: getRevenue(lastMonthKey) * gpRate - lastMonthOverhead },
      nextMonth: { label: format(addMonths(now, 1), 'MMM yyyy'), pureProfit: getRevenue(nextMonthKey) * gpRate - nextMonthOverhead },
    };
  }, [claims, activeGpPercent, lastMonthOverhead, nextMonthOverhead]);

  type SortField = 'job_name' | 'contract_value_ex_gst' | 'forecast_cost' | 'forecast_gross_profit' | 'forecast_gp_percent';
  type SortDir = 'asc' | 'desc';
  const [sortField, setSortField] = useState<SortField>('forecast_gp_percent');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const groupedProjects = useMemo(() => {
    const active = projects.filter(p => p.status === 'Active');
    const sortFn = (a: typeof active[0], b: typeof active[0]) => {
      const aVal = a[sortField] as number | string;
      const bVal = b[sortField] as number | string;
      if (typeof aVal === 'string') return sortDir === 'asc' ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    };
    const categories = ['pre_construction', 'construction'] as const;
    return categories.map(cat => ({
      category: cat,
      label: cat === 'pre_construction' ? 'Pre Construction' : 'Construction',
      projects: active.filter(p => p.category === cat).sort(sortFn),
    }));
  }, [projects, sortField, sortDir]);

  const sorted = useMemo(() => groupedProjects.flatMap(g => g.projects), [groupedProjects]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'job_name' ? 'asc' : 'desc');
    }
  };

  const projectHealth = useMemo(() => {
    if (!projects.length) return null;
    const active = projects.filter(p => p.status === 'Active');
    const greenThreshold = kpi?.gp_threshold_green ?? 17;
    const orangeThreshold = kpi?.gp_threshold_orange ?? 12;
    const healthy = active.filter(p => p.forecast_gp_percent >= greenThreshold).length;
    const atRisk = active.filter(p => p.forecast_gp_percent >= orangeThreshold && p.forecast_gp_percent < greenThreshold).length;
    const critical = active.filter(p => p.forecast_gp_percent > 0 && p.forecast_gp_percent < orangeThreshold).length;
    const totalContract = projects.reduce((s, p) => s + p.contract_value_ex_gst, 0);
    const totalGP = projects.reduce((s, p) => s + p.forecast_gross_profit, 0);
    const weightedGp = totalContract > 0 ? (totalGP / totalContract) * 100 : 0;
    const byCat = {
      pre_construction: projects.filter(p => p.category === 'pre_construction').length,
      construction: projects.filter(p => p.category === 'construction').length,
      handover: projects.filter(p => p.category === 'handover').length,
    };
    return { total: projects.length, active: active.length, healthy, atRisk, critical, totalContract, totalGP, weightedGp, byCat };
  }, [projects, kpi]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => isAfter(parseISO(e.start_time), now))
      .slice(0, 5);
  }, [events]);

  // Role-specific header title
  const headerTitle = roleInfo.isConstructionManager
    ? 'Construction Health'
    : roleInfo.isSalesManager
      ? 'Sales Dashboard'
      : 'Dashboard';

  const shared = {
    projects,
    projLoading,
    kpi,
    claims,
    events,
    eventsLoading,
    unreadCount,
    claimsRevenue,
    activeGpPercent,
    projectHealth,
    upcomingEvents,
    monthlyKPI,
    currentFortnightKPI,
    previousFortnightKPI,
    selectedMonth,
    selectedFortnight,
    overheadOverride,
    onOverheadChange: setOverheadOverride,
    adjacentMonthProfits,
    lastMonthOverhead,
    nextMonthOverhead,
    onLastMonthOverheadChange: setLastMonthOverhead,
    onNextMonthOverheadChange: setNextMonthOverhead,
    bhagTarget,
    onBhagChange: handleBhagChange,
    onBhagCommit: handleBhagCommit,
    groupedProjects,
    sorted,
    handleSort,
    sortField,
    sortDir,
    t,
    navigate,
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">{headerTitle}</h1>
                  {roleInfo.isSalesManager && (
                    <p className="text-xs text-muted-foreground mt-0.5">Bob Lay, Sales Manager</p>
                  )}
                </div>
                <TodayWidget variant="inline" />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                  Viewing as: {getRoleLabel(roleInfo.role)}
                </Badge>
                {unreadCount > 0 && (
                  <button
                    onClick={() => navigate('/inbox')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">{unreadCount} unread</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
          <RoleDashboard roleInfo={roleInfo} shared={shared} />
        </main>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
