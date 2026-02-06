import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Users, HardHat, Briefcase, Calculator, FileText, Pencil, Trash2, Network, List, Crown, User } from 'lucide-react';
import { OrgChartTree } from '@/components/org/OrgChartTree';
import { buildOrgTree, TeamMember, getRoleLevelColor, getRoleLevelLabel } from '@/lib/orgChart';

type TeamDepartment = 'site_supervisor' | 'management' | 'administration' | 'accounts';
type RoleLevel = 'director' | 'manager' | 'staff';

const departmentConfig: Record<TeamDepartment, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  site_supervisor: { label: 'Site Supervisors', icon: HardHat, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  management: { label: 'Management', icon: Briefcase, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  administration: { label: 'Administration', icon: FileText, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  accounts: { label: 'Accounts', icon: Calculator, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const roleLevelConfig: Record<RoleLevel, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  director: { label: 'Director', icon: Crown },
  manager: { label: 'Manager', icon: Briefcase },
  staff: { label: 'Staff', icon: User },
};

const teamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(20).optional().or(z.literal('')),
  department: z.enum(['site_supervisor', 'management', 'administration', 'accounts']),
  job_title: z.string().max(100).optional().or(z.literal('')),
  role_level: z.enum(['director', 'manager', 'staff']),
  reports_to: z.string().uuid().nullable().optional(),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export default function Team() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | TeamDepartment>('all');
  const [viewMode, setViewMode] = useState<'list' | 'org'>('list');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: 'site_supervisor',
      job_title: '',
      role_level: 'staff',
      reports_to: null,
    },
  });

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const { error } = await supabase.from('team_members').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        department: data.department,
        job_title: data.job_title || null,
        role_level: data.role_level,
        reports_to: data.reports_to || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member added successfully' });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error adding team member', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TeamMemberFormData }) => {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          department: data.department,
          job_title: data.job_title || null,
          role_level: data.role_level,
          reports_to: data.reports_to || null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member updated successfully' });
      setIsDialogOpen(false);
      setEditingMember(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Error updating team member', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member removed successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error removing team member', description: error.message, variant: 'destructive' });
    },
  });

  const handleSubmit = (data: TeamMemberFormData) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      department: member.department,
      job_title: member.job_title || '',
      role_level: member.role_level,
      reports_to: member.reports_to,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingMember(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      department: 'site_supervisor',
      job_title: '',
      role_level: 'staff',
      reports_to: null,
    });
    setIsDialogOpen(true);
  };

  const handleOrgChartClick = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      handleEdit(member);
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesDepartment = activeTab === 'all' || member.department === activeTab;
    return matchesSearch && matchesDepartment;
  });

  const departmentCounts = teamMembers.reduce(
    (acc, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1;
      return acc;
    },
    {} as Record<TeamDepartment, number>
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get managers/directors for the reports_to dropdown
  const potentialManagers = teamMembers.filter(
    m => m.role_level === 'director' || m.role_level === 'manager'
  );

  // Build org tree for visualization
  const orgTree = buildOrgTree(teamMembers);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground">Manage your team members across all departments</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border rounded-lg p-1 bg-muted/50">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant={viewMode === 'org' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('org')}
                className="gap-2"
              >
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">Org Chart</span>
              </Button>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@lanconqld.com.au" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="0412 345 678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(departmentConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="role_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(roleLevelConfig).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <config.icon className="h-4 w-4" />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Site Supervisor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reports_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reports To (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                            value={field.value || 'none'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select manager" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No Manager (Top Level)</SelectItem>
                              {potentialManagers
                                .filter(m => m.id !== editingMember?.id)
                                .map((manager) => (
                                  <SelectItem key={manager.id} value={manager.id}>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {getRoleLevelLabel(manager.role_level)}
                                      </Badge>
                                      {manager.name}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingMember ? 'Update' : 'Add'} Member
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Department Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(departmentConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = departmentCounts[key as TeamDepartment] || 0;
            return (
              <Card key={key} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Org Chart View */}
        {viewMode === 'org' && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Organization Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading org chart...</div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members yet. Add your first team member to see the org chart!
                </div>
              ) : (
                <ScrollArea className="w-full">
                  <div className="min-w-[800px] py-6">
                    <OrgChartTree nodes={orgTree} onMemberClick={handleOrgChartClick} />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Tabs and Table */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="all" className="gap-2">
                  <Users className="h-4 w-4" />
                  All ({teamMembers.length})
                </TabsTrigger>
                {Object.entries(departmentConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <TabsTrigger key={key} value={key} className="gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="sm:hidden">{(departmentCounts[key as TeamDepartment] || 0)}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {activeTab === 'all' ? 'All Team Members' : departmentConfig[activeTab as TeamDepartment].label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading team members...</div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No team members match your search' : 'No team members yet. Add your first team member!'}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role Level</TableHead>
                            <TableHead className="hidden md:table-cell">Reports To</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="hidden sm:table-cell">Job Title</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMembers.map((member) => {
                            const deptConfig = departmentConfig[member.department];
                            const manager = member.reports_to 
                              ? teamMembers.find(m => m.id === member.reports_to)
                              : null;
                            return (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className={getRoleLevelColor(member.role_level) + " text-xs"}>
                                        {getInitials(member.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <span className="font-medium">{member.name}</span>
                                      <p className="text-xs text-muted-foreground">{member.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getRoleLevelColor(member.role_level)}>
                                    {getRoleLevelLabel(member.role_level)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-muted-foreground">
                                  {manager ? manager.name : '—'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={deptConfig.color}>
                                    {deptConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-muted-foreground">
                                  {member.job_title || '—'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteMutation.mutate(member.id)}
                                      disabled={deleteMutation.isPending}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
