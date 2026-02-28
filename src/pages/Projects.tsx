import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Search } from 'lucide-react';
import { useProjects, ProjectRow, ProjectCategory } from '@/hooks/useProjects';
import { useProjectTrends } from '@/hooks/useProjectTrends';
import { useProjectClaimStages } from '@/hooks/useProjectClaimStages';
import { useKPISettings } from '@/hooks/useKPISettings';
import { useWeatherEOTLogs } from '@/hooks/useWeatherEOTLogs';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import { ProjectCategorySection } from '@/components/projects/ProjectCategorySection';
import { PortfolioSummary } from '@/components/projects/PortfolioSummary';

const categoryOrder: { key: ProjectCategory; label: string }[] = [
  { key: 'pre_construction', label: 'Pre Construction' },
  { key: 'construction', label: 'Construction' },
  { key: 'handover', label: 'Handover' },
];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillName = searchParams.get('prefill_name') || undefined;
  const prefillValue = searchParams.get('prefill_value') || undefined;
  const hasPrefill = !!prefillName;

  const { projects, isLoading, addProject, updateProject } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: trends } = useProjectTrends(projectIds);
  const { data: claimStages } = useProjectClaimStages(projectIds);
  const { data: kpiSettings } = useKPISettings();
  const { tallies: eotTallies } = useWeatherEOTLogs();
  const gpThresholds = kpiSettings ? { green: kpiSettings.gp_threshold_green, orange: kpiSettings.gp_threshold_orange } : undefined;
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const expandedProjectId = editingProject?.id ?? null;
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [filterManager, setFilterManager] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const siteManagerList = useMemo(() => {
    const set = new Set(projects.map(p => p.site_manager).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filterManager !== 'all' && p.site_manager !== filterManager) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchAddress = p.address?.toLowerCase().includes(q);
        const matchClient = p.client_name?.toLowerCase().includes(q);
        const matchJob = p.job_name?.toLowerCase().includes(q);
        if (!matchAddress && !matchClient && !matchJob) return false;
      }
      return true;
    });
  }, [projects, filterManager, searchQuery]);

  const handleToggleEdit = (project: ProjectRow | null) => {
    if (!project) { setEditingProject(null); return; }
    setEditingProject(prev => prev?.id === project.id ? null : project);
  };

  const grouped = useMemo(() => {
    return categoryOrder.map(cat => ({
      ...cat,
      projects: filteredProjects.filter(p => p.category === cat.key),
    }));
  }, [filteredProjects]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Building Contracts</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search address or client..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-52 h-9 text-sm"
              />
            </div>
            <Select value={filterManager} onValueChange={setFilterManager}>
              <SelectTrigger className="w-44 h-9 text-sm"><SelectValue placeholder="All Site Managers" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Site Managers</SelectItem>
                {siteManagerList.map(sm => <SelectItem key={sm} value={sm}>{sm}</SelectItem>)}
              </SelectContent>
            </Select>
            <AddProjectDialog
              onSubmit={(data) => {
                addProject.mutate(data);
                // Clear prefill params after submission
                if (hasPrefill) setSearchParams({});
              }}
              isSubmitting={addProject.isPending}
              defaultOpen={hasPrefill}
              prefillClientName={prefillName}
              prefillContractValue={prefillValue}
            />
          </div>
        </header>

        <main className="mx-auto max-w-7xl w-full px-6 py-8 space-y-8">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No projects yet</p>
              <p className="text-sm text-muted-foreground">Click "Add a New Contract" to get started.</p>
            </div>
          ) : (
            <>
              {grouped.map(group => (
                <ProjectCategorySection
                  key={group.key}
                  label={group.label}
                  projects={group.projects}
                  onEdit={handleToggleEdit}
                  onSubmitEdit={(data) => updateProject.mutate(data)}
                  isSubmittingEdit={updateProject.isPending}
                  expandedProjectId={expandedProjectId}
                  trends={trends}
                  claimStages={claimStages}
                  highlighted={highlightCategory === null || highlightCategory === group.key}
                  eotTallies={eotTallies}
                />
              ))}
              <PortfolioSummary
                projects={projects}
                onCategoryClick={(cat) => setHighlightCategory(prev => prev === cat ? null : cat)}
                activeCategory={highlightCategory}
                gpThresholds={gpThresholds}
              />
            </>
          )}
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}
