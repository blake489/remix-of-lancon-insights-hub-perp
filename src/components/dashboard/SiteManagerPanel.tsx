import { useMemo } from 'react';
import { SiteManagerActivity, Project } from '@/types/dashboard';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MessageSquare, Camera, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SiteManagerPanelProps {
  activities: SiteManagerActivity[];
  projects: Project[];
  siteManagers: string[];
  onActivityUpdate?: (activityId: string, field: keyof SiteManagerActivity, value: boolean | number) => void;
}

interface SiteManagerSummary {
  name: string;
  totalJobs: number;
  clientMessagesComplete: number;
  photosComplete: number;
  hsComplete: number;
  activities: (SiteManagerActivity & { project: Project })[];
}

export function SiteManagerPanel({ 
  activities, 
  projects, 
  siteManagers,
  onActivityUpdate 
}: SiteManagerPanelProps) {
  const summaries: SiteManagerSummary[] = useMemo(() => {
    return siteManagers.map(sm => {
      const smActivities = activities
        .filter(a => a.siteManager === sm)
        .map(a => ({
          ...a,
          project: projects.find(p => p.id === a.projectId)!,
        }))
        .filter(a => a.project);

      return {
        name: sm,
        totalJobs: smActivities.length,
        clientMessagesComplete: smActivities.filter(a => a.clientMessageSent).length,
        photosComplete: smActivities.filter(a => a.photoUploads > 0).length,
        hsComplete: smActivities.filter(a => a.hsWalkthroughCompleted).length,
        activities: smActivities,
      };
    }).filter(s => s.totalJobs > 0);
  }, [activities, projects, siteManagers]);

  const getCompletionPercent = (complete: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((complete / total) * 100);
  };

  const CompletionBadge = ({ complete, total }: { complete: number; total: number }) => {
    const percent = getCompletionPercent(complete, total);
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
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Site Manager Performance</h2>
          <p className="text-sm text-muted-foreground font-medium">Fortnightly checklist tracking</p>
        </div>
      </div>

      {summaries.map((summary, idx) => (
        <div 
          key={summary.name} 
          className="glass-card overflow-hidden opacity-0 animate-scale-in"
          style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
        >
          {/* Site Manager Header */}
          <div className="bg-muted/30 px-6 py-5 border-b border-border/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-bold text-foreground text-lg">{summary.name}</h3>
              <div className="flex gap-5">
                <div className="flex items-center gap-2.5 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Messages:</span>
                  <CompletionBadge complete={summary.clientMessagesComplete} total={summary.totalJobs} />
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">Photos:</span>
                  <CompletionBadge complete={summary.photosComplete} total={summary.totalJobs} />
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">H&S:</span>
                  <CompletionBadge complete={summary.hsComplete} total={summary.totalJobs} />
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="pl-6">Project</TableHead>
                <TableHead className="text-center">Client Message</TableHead>
                <TableHead className="text-center">Photos</TableHead>
                <TableHead className="text-center">H&S Walk</TableHead>
                <TableHead className="text-center pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.activities.map((activity) => {
                const isComplete = activity.clientMessageSent && activity.photoUploads > 0 && activity.hsWalkthroughCompleted;
                const hasMissing = !activity.clientMessageSent || activity.photoUploads === 0;
                
                return (
                  <TableRow 
                    key={activity.id}
                    className={cn(
                      'group transition-colors duration-200',
                      hasMissing && 'bg-danger/[0.03]'
                    )}
                  >
                    <TableCell className="pl-6">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{activity.project.jobName}</p>
                        <p className="text-xs text-muted-foreground font-medium">{activity.project.currentStage}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Checkbox 
                          checked={activity.clientMessageSent}
                          onCheckedChange={(checked) => 
                            onActivityUpdate?.(activity.id, 'clientMessageSent', !!checked)
                          }
                          className={cn(
                            'h-5 w-5 transition-all duration-200',
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
                          onActivityUpdate?.(activity.id, 'photoUploads', parseInt(e.target.value) || 0)
                        }
                        className={cn(
                          'w-16 text-center mx-auto h-9 bg-card/80 backdrop-blur-sm border-border/50 font-medium tabular-nums',
                          activity.photoUploads === 0 && 'border-danger'
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Checkbox 
                          checked={activity.hsWalkthroughCompleted}
                          onCheckedChange={(checked) => 
                            onActivityUpdate?.(activity.id, 'hsWalkthroughCompleted', !!checked)
                          }
                          className="h-5 w-5 transition-all duration-200"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1.5 text-success text-sm font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          Complete
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-danger text-sm font-semibold">
                          <AlertCircle className="h-4 w-4" />
                          Incomplete
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
