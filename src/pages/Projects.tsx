import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { FileText } from 'lucide-react';
import { getProjectsWithMetrics, siteManagers } from '@/data/mockData';

export default function Projects() {
  const projectsWithMetrics = getProjectsWithMetrics();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Projects</h1>
          </div>
        </header>

        <main className="mx-auto max-w-7xl w-full px-6 py-8">
          <ProjectTable
            projects={projectsWithMetrics}
            siteManagers={siteManagers}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
