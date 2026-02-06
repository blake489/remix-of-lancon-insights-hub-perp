import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OrgChartNode, getRoleLevelColor, getRoleLevelLabel } from '@/lib/orgChart';
import { cn } from '@/lib/utils';
import { User, Users, Crown, Briefcase } from 'lucide-react';

interface OrgChartCardProps {
  node: OrgChartNode;
  onClick?: (memberId: string) => void;
}

function getRoleIcon(level: 'director' | 'manager' | 'staff') {
  switch (level) {
    case 'director':
      return Crown;
    case 'manager':
      return Briefcase;
    case 'staff':
      return User;
  }
}

function getDepartmentLabel(department: string): string {
  const labels: Record<string, string> = {
    site_supervisor: 'Site Supervisor',
    management: 'Management',
    administration: 'Administration',
    accounts: 'Accounts',
  };
  return labels[department] || department;
}

export function OrgChartCard({ node, onClick }: OrgChartCardProps) {
  const { member } = node;
  const RoleIcon = getRoleIcon(member.role_level);
  
  const initials = member.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-105 min-w-[200px]",
        member.role_level === 'director' && "border-primary/50 shadow-md",
        member.role_level === 'manager' && "border-secondary/50"
      )}
      onClick={() => onClick?.(member.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className={cn(
            "h-12 w-12 shrink-0",
            member.role_level === 'director' && "ring-2 ring-primary ring-offset-2"
          )}>
            <AvatarFallback className={cn(
              "text-sm font-semibold",
              getRoleLevelColor(member.role_level)
            )}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{member.name}</h4>
              <RoleIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>
            
            {member.job_title && (
              <p className="text-xs text-muted-foreground truncate">
                {member.job_title}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {getDepartmentLabel(member.department)}
              </Badge>
              <Badge className={cn("text-xs", getRoleLevelColor(member.role_level))}>
                {getRoleLevelLabel(member.role_level)}
              </Badge>
            </div>
          </div>
        </div>
        
        {node.children.length > 0 && (
          <div className="flex items-center gap-1 mt-3 pt-2 border-t text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{node.children.length} direct report{node.children.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
