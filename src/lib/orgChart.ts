import { Tables } from '@/integrations/supabase/types';

export type TeamMember = Tables<'team_members'> & {
  reports_to: string | null;
  role_level: 'director' | 'manager' | 'staff';
};

export interface OrgChartNode {
  member: TeamMember;
  children: OrgChartNode[];
}

export function buildOrgTree(members: TeamMember[]): OrgChartNode[] {
  const memberMap = new Map<string, TeamMember>();
  const childrenMap = new Map<string, TeamMember[]>();

  // Build maps
  members.forEach(member => {
    memberMap.set(member.id, member);
    if (!childrenMap.has(member.id)) {
      childrenMap.set(member.id, []);
    }
  });

  // Group children under their managers
  members.forEach(member => {
    if (member.reports_to && memberMap.has(member.reports_to)) {
      const children = childrenMap.get(member.reports_to) || [];
      children.push(member);
      childrenMap.set(member.reports_to, children);
    }
  });

  // Build tree recursively
  function buildNode(member: TeamMember): OrgChartNode {
    const children = childrenMap.get(member.id) || [];
    // Sort children: directors first, then managers, then staff
    const sortedChildren = children.sort((a, b) => {
      const levelOrder = { director: 0, manager: 1, staff: 2 };
      return levelOrder[a.role_level] - levelOrder[b.role_level];
    });

    return {
      member,
      children: sortedChildren.map(buildNode),
    };
  }

  // Find root nodes (no manager or manager not in list)
  const roots = members.filter(
    member => !member.reports_to || !memberMap.has(member.reports_to)
  );

  // Sort roots: directors first
  const sortedRoots = roots.sort((a, b) => {
    const levelOrder = { director: 0, manager: 1, staff: 2 };
    return levelOrder[a.role_level] - levelOrder[b.role_level];
  });

  return sortedRoots.map(buildNode);
}

export function getRoleLevelColor(level: 'director' | 'manager' | 'staff'): string {
  switch (level) {
    case 'director':
      return 'bg-primary text-primary-foreground';
    case 'manager':
      return 'bg-secondary text-secondary-foreground';
    case 'staff':
      return 'bg-muted text-muted-foreground';
  }
}

export function getRoleLevelLabel(level: 'director' | 'manager' | 'staff'): string {
  switch (level) {
    case 'director':
      return 'Director';
    case 'manager':
      return 'Manager';
    case 'staff':
      return 'Staff';
  }
}
