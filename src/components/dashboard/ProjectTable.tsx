import { useState, useMemo } from 'react';
import { ProjectWithMetrics, ProjectStatus } from '@/types/dashboard';
import { formatCurrency, formatPercent, formatVariance } from '@/lib/formatters';
import { StatusBadge } from './StatusBadge';
import { TrafficLight } from './TrafficLight';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp, ChevronsUpDown, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: ProjectWithMetrics[];
  siteManagers: string[];
}

type SortField = 'gpPercent' | 'contractValue' | 'monthlyClaims' | 'daysLost';
type SortDirection = 'asc' | 'desc';

export function ProjectTable({ projects, siteManagers }: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>('gpPercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterSiteManager, setFilterSiteManager] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply filters
    if (filterSiteManager !== 'all') {
      filtered = filtered.filter(p => p.siteManager === filterSiteManager);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case 'gpPercent':
          aVal = a.forecastGpPercent;
          bVal = b.forecastGpPercent;
          break;
        case 'contractValue':
          aVal = a.contractValueExGst;
          bVal = b.contractValueExGst;
          break;
        case 'monthlyClaims':
          aVal = a.monthlyClaimsExGst;
          bVal = b.monthlyClaimsExGst;
          break;
        case 'daysLost':
          aVal = a.timing.daysLost;
          bVal = b.timing.daysLost;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [projects, sortField, sortDirection, filterSiteManager, filterStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" /> 
      : <ChevronDown className="h-4 w-4" />;
  };

  const getGpStatus = (gpPercent: number): 'success' | 'warning' | 'danger' => {
    if (gpPercent >= 16) return 'success';
    if (gpPercent >= 12) return 'warning';
    return 'danger';
  };

  const ScheduleIcon = ({ status }: { status: 'ahead' | 'on-time' | 'behind' }) => {
    switch (status) {
      case 'ahead':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'on-time':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'behind':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-foreground">Active Projects</h2>
        <div className="flex gap-3">
          <Select value={filterSiteManager} onValueChange={setFilterSiteManager}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Site Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Site Managers</SelectItem>
              {siteManagers.map(sm => (
                <SelectItem key={sm} value={sm}>{sm}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ProjectStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Project</TableHead>
              <TableHead>Site Manager</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('contractValue')}
              >
                <span className="flex items-center gap-1">
                  Contract Value
                  <SortIcon field="contractValue" />
                </span>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('monthlyClaims')}
              >
                <span className="flex items-center gap-1">
                  This Month
                  <SortIcon field="monthlyClaims" />
                </span>
              </TableHead>
              <TableHead>Cumulative</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('gpPercent')}
              >
                <span className="flex items-center gap-1">
                  Forecast GP%
                  <SortIcon field="gpPercent" />
                </span>
              </TableHead>
              <TableHead>Variance</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('daysLost')}
              >
                <span className="flex items-center gap-1">
                  Schedule
                  <SortIcon field="daysLost" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{project.jobName}</p>
                    <p className="text-sm text-muted-foreground">{project.clientName}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{project.siteManager}</TableCell>
                <TableCell className="font-medium">{formatCurrency(project.contractValueExGst, true)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(project.monthlyClaimsExGst, true)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatCurrency(project.cumulativeClaimsExGst, true)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrafficLight status={getGpStatus(project.forecastGpPercent)} size="sm" />
                    <span className={cn(
                      'font-semibold',
                      getGpStatus(project.forecastGpPercent) === 'success' && 'text-success',
                      getGpStatus(project.forecastGpPercent) === 'warning' && 'text-warning',
                      getGpStatus(project.forecastGpPercent) === 'danger' && 'text-danger',
                    )}>
                      {formatPercent(project.forecastGpPercent)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className={cn(
                      'text-sm font-medium',
                      project.gpVariancePercent >= 0 ? 'text-success' : 'text-danger'
                    )}>
                      {formatVariance(project.gpVariancePercent, true)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatVariance(project.gpVarianceDollars)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ScheduleIcon status={project.scheduleStatus} />
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {project.timing.daysUsed}/{project.timing.workingDays}d
                      </p>
                      {project.timing.daysLost > 0 && (
                        <p className="text-xs text-danger">-{project.timing.daysLost} lost</p>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
