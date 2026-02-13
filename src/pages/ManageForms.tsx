import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useSourceForms, useDeleteForm } from '@/hooks/useSourceForms';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ManageForms() {
  const { data: forms, isLoading } = useSourceForms();
  const deleteForm = useDeleteForm();

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                  <Link to="/source-data"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-xl font-semibold text-foreground">Manage Forms</h1>
              </div>
              <Button asChild size="sm">
                <Link to="/source-data/manage/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Form
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : !forms?.length ? (
            <p className="text-muted-foreground">No forms yet. Create your first one above.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Assigned Staff</TableHead>
                    <TableHead className="text-center">Submissions</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map(form => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell>{form.assigned_staff?.name || '—'}</TableCell>
                      <TableCell className="text-center">{form._count?.responses || 0}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={form.is_active ? 'default' : 'secondary'}>
                          {form.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link to={`/source-data/manage/${form.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{form.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the form and all its submissions. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteForm.mutate(form.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
