import { useState } from 'react';
import { SiteManagerPanel } from '@/components/dashboard/SiteManagerPanel';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { mockProjects, mockSiteManagerActivities } from '@/data/mockData';
import { SiteManagerActivity } from '@/types/dashboard';
import { useSiteManagers } from '@/hooks/useSiteManagers';

const SiteManagers = () => {
  const [activities, setActivities] = useState(mockSiteManagerActivities);
  const { siteManagers, isLoading } = useSiteManagers();

  const handleActivityUpdate = (activityId: string, field: keyof SiteManagerActivity, value: boolean | number) => {
    setActivities(prev =>
      prev.map(a =>
        a.id === activityId ? { ...a, [field]: value } : a
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <h1 className="text-xl font-semibold text-foreground">Site Managers</h1>
          </div>
        </div>
        <main className="mx-auto max-w-7xl px-6 py-8">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <SiteManagerPanel
              activities={activities}
              projects={mockProjects}
              siteManagers={siteManagers}
              onActivityUpdate={handleActivityUpdate}
            />
          )}
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SiteManagers;
