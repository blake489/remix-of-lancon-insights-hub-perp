import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPISettingsForm } from '@/components/settings/KPISettingsForm';
import { KPIAuditTrail } from '@/components/settings/KPIAuditTrail';
import { useKPISettings, useKPISettingsAudit, useUserRole } from '@/hooks/useKPISettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Settings() {
  const { data: settings, isLoading: settingsLoading } = useKPISettings();
  const { data: auditRecords, isLoading: auditLoading } = useKPISettingsAudit();
  const { data: userRole, isLoading: roleLoading } = useUserRole();

  const isAdmin = userRole?.isAdmin ?? false;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Settings</h1>
            {!roleLoading && (
              <Badge variant={isAdmin ? 'default' : 'secondary'}>
                <Shield className="mr-1 h-3 w-3" />
                {isAdmin ? 'Administrator' : 'Viewer'}
              </Badge>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Core Settings</h2>
              <p className="text-muted-foreground">
                Configure the KPI metrics and performance targets that drive dashboard calculations.
              </p>
            </div>

            <Tabs defaultValue="settings" className="space-y-6">
              <TabsList>
                <TabsTrigger value="settings">KPI Settings</TabsTrigger>
                <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              </TabsList>

              <TabsContent value="settings">
                {settingsLoading || roleLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[200px] w-full" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : settings ? (
                  <KPISettingsForm settings={settings} isAdmin={isAdmin} />
                ) : (
                  <p className="text-muted-foreground">Failed to load settings.</p>
                )}
              </TabsContent>

              <TabsContent value="audit">
                <KPIAuditTrail 
                  auditRecords={auditRecords ?? []} 
                  isLoading={auditLoading} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
