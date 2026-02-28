import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MessageSquare, Camera, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { SiteManagerActivity, Project } from '@/types/dashboard';
import { mockSiteManagerActivities, mockProjects } from '@/data/mockData';

interface SiteManagerPopoverProps {
  siteManagerName: string;
  children: React.ReactNode;
}

function CompletionBadge({ complete, total }: { complete: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((complete / total) * 100);
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
      percent === 100 && 'bg-success-muted text-success',
      percent >= 50 && percent < 100 && 'bg-warning-muted text-warning',
      percent < 50 && 'bg-danger-muted text-danger',
    )}>
      {percent === 100 ? <CheckCircle2 className="h-3 w-3" /> : null}
      {complete}/{total}
    </span>
  );
}

export function SiteManagerPopover({ siteManagerName, children }: SiteManagerPopoverProps) {
  const [activities, setActivities] = useState<SiteManagerActivity[]>(mockSiteManagerActivities);

  const smActivities = activities
    .filter(a => a.siteManager === siteManagerName.toUpperCase())
    .map(a => ({
      ...a,
      project: mockProjects.find(p => p.id === a.projectId),
    }))
    .filter(a => a.project);

  const totalJobs = smActivities.length;
  const messagesComplete = smActivities.filter(a => a.clientMessageSent).length;
  const photosComplete = smActivities.filter(a => a.photoUploads > 0).length;
  const hsComplete = smActivities.filter(a => a.hsWalkthroughCompleted).length;

  const handleUpdate = (activityId: string, field: keyof SiteManagerActivity, value: boolean | number) => {
    setActivities(prev =>
      prev.map(a => a.id === activityId ? { ...a, [field]: value } : a)
    );
  };

  if (totalJobs === 0) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[580px] p-0" 
        align="start" 
        side="bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">{siteManagerName.toUpperCase()}</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Messages:</span>
                <CompletionBadge complete={messagesComplete} total={totalJobs} />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Photos:</span>
                <CompletionBadge complete={photosComplete} total={totalJobs} />
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">H&S:</span>
                <CompletionBadge complete={hsComplete} total={totalJobs} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="pl-4 text-xs">Project</TableHead>
              <TableHead className="text-center text-xs">Client Message</TableHead>
              <TableHead className="text-center text-xs">Photos</TableHead>
              <TableHead className="text-center text-xs">H&S Walk</TableHead>
              <TableHead className="text-center pr-4 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {smActivities.map((activity) => {
              const isComplete = activity.clientMessageSent && activity.photoUploads > 0 && activity.hsWalkthroughCompleted;
              const hasMissing = !activity.clientMessageSent || activity.photoUploads === 0;

              return (
                <TableRow
                  key={activity.id}
                  className={cn(
                    'transition-colors duration-200',
                    hasMissing && 'bg-danger/[0.03]'
                  )}
                >
                  <TableCell className="pl-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-xs">{activity.project!.jobName}</p>
                      <p className="text-[10px] text-muted-foreground">{activity.project!.currentStage}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={activity.clientMessageSent}
                        onCheckedChange={(checked) =>
                          handleUpdate(activity.id, 'clientMessageSent', !!checked)
                        }
                        className={cn(
                          'h-4 w-4',
                          !activity.clientMessageSent && 'border-danger'
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min={0}
                      value={activity.photoUploads}
                      onChange={(e) =>
                        handleUpdate(activity.id, 'photoUploads', parseInt(e.target.value) || 0)
                      }
                      className={cn(
                        'w-14 text-center mx-auto h-7 text-xs bg-card/80 border-border/50 font-medium tabular-nums',
                        activity.photoUploads === 0 && 'border-danger'
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={activity.hsWalkthroughCompleted}
                        onCheckedChange={(checked) =>
                          handleUpdate(activity.id, 'hsWalkthroughCompleted', !!checked)
                        }
                        className="h-4 w-4"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center pr-4">
                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 text-success text-xs font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-danger text-xs font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Incomplete
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </PopoverContent>
    </Popover>
  );
}
