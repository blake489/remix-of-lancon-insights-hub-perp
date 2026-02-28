import { useMemo, useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { useProjects, ProjectRow, ProjectCategory } from '@/hooks/useProjects';
import { useProjectTrends } from '@/hooks/useProjectTrends';
import { useProjectClaimStages } from '@/hooks/useProjectClaimStages';
import { useKPISettings } from '@/hooks/useKPISettings';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import { EditProjectDialog } from '@/components/projects/EditProjectDialog';
import { ProjectCategorySection } from '@/components/projects/ProjectCategorySection';
import { PortfolioSummary } from '@/components/projects/PortfolioSummary';

const categoryOrder: { key: ProjectCategory; label: string }[] = [
  { key: 'pre_construction', label: 'Pre Construction' },
  { key: 'construction', label: 'Construction' },
  { key: 'handover', label: 'Handover' },
];

export default function Projects() {
  const { projects, isLoading, addProject, updateProject } = useProjects();
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);
  const { data: trends } = useProjectTrends(projectIds);
  const { data: claimStages } = useProjectClaimStages(projectIds);
  const { data: kpiSettings } = useKPISettings();
  const gpThresholds = kpiSettings ? { green: kpiSettings.gp_threshold_green, orange: kpiSettings.gp_threshold_orange } : undefined;
  const [editingProject, setEditingProject] = useState<ProjectRow | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return categoryOrder.map(cat => ({
      ...cat,
      projects: projects.filter(p => p.category === cat.key),
    }));
  }, [projects]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3 flex-1">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Projects</h1>
          </div>
          <AddProjectDialog
            onSubmit={(data) => addProject.mutate(data)}
            isSubmitting={addProject.isPending}
          />
        </header>

        <main className="mx-auto max-w-7xl w-full px-6 py-8 space-y-8">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No projects yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Project" to get started.</p>
            </div>
          ) : (
            <>
               {grouped.map(group => (
                <ProjectCategorySection
                  key={group.key}
                  label={group.label}
                  projects={group.projects}
                  onEdit={setEditingProject}
                  trends={trends}
                  claimStages={claimStages}
                  highlighted={highlightCategory === null || highlightCategory === group.key}
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

        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => { if (!open) setEditingProject(null); }}
          onSubmit={(data) => updateProject.mutate(data)}
          isSubmitting={updateProject.isPending}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
