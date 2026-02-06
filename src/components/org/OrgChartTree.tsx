import { OrgChartNode } from '@/lib/orgChart';
import { OrgChartCard } from './OrgChartCard';
import { cn } from '@/lib/utils';

interface OrgChartTreeProps {
  nodes: OrgChartNode[];
  onMemberClick?: (memberId: string) => void;
  level?: number;
}

export function OrgChartTree({ nodes, onMemberClick, level = 0 }: OrgChartTreeProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <div className={cn(
        "flex flex-wrap justify-center gap-6",
        level > 0 && "pt-6"
      )}>
        {nodes.map((node) => (
          <div key={node.member.id} className="flex flex-col items-center">
            {/* Connector line from parent */}
            {level > 0 && (
              <div className="w-px h-6 bg-border -mt-6 mb-0" />
            )}
            
            {/* The card */}
            <OrgChartCard node={node} onClick={onMemberClick} />
            
            {/* Children */}
            {node.children.length > 0 && (
              <div className="flex flex-col items-center">
                {/* Vertical line down to children */}
                <div className="w-px h-6 bg-border" />
                
                {/* Horizontal connector if multiple children */}
                {node.children.length > 1 && (
                  <div 
                    className="h-px bg-border" 
                    style={{ 
                      width: `${Math.min(node.children.length * 220, 800)}px` 
                    }} 
                  />
                )}
                
                {/* Render children */}
                <OrgChartTree 
                  nodes={node.children} 
                  onMemberClick={onMemberClick}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
