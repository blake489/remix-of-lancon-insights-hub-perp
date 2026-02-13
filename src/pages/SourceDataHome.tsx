import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useSourceForms } from '@/hooks/useSourceForms';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Settings, ClipboardList } from 'lucide-react';

export default function SourceDataHome() {
  const { data: forms, isLoading } = useSourceForms();
  const activeForms = forms?.filter(f => f.is_active) || [];

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Source Data</h1>
                <p className="text-sm text-muted-foreground mt-1">Submit and manage data entry forms</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/source-data/manage">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Forms
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {isLoading ? (
            <p className="text-muted-foreground">Loading forms…</p>
          ) : activeForms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No active forms yet.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link to="/source-data/manage/new">Create your first form</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeForms.map(form => (
                <Link key={form.id} to={`/source-data/form/${form.slug}`}>
                  <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <FileText className="h-5 w-5 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {form._count?.responses || 0} submissions
                        </Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{form.name}</CardTitle>
                      {form.description && (
                        <CardDescription className="line-clamp-2">{form.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {form.assigned_staff && (
                        <p className="text-xs text-muted-foreground">
                          Assigned to: <span className="font-medium text-foreground">{form.assigned_staff.name}</span>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
