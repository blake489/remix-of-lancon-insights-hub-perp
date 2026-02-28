import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { History, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClaimMove {
  id: string;
  claim_id: string;
  project_id: string;
  claim_type: string;
  old_date: string;
  new_date: string;
  days_delta: number;
  reason_category: string | null;
  reason_text: string | null;
  moved_at: string;
}

interface ClaimMoveAuditPanelProps {
  projectId: string;
  projectName: string;
}

export function ClaimMoveAuditPanel({ projectId, projectName }: ClaimMoveAuditPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const { data: moves = [], isLoading } = useQuery({
    queryKey: ['claim-moves', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claim_moves')
        .select('*')
        .eq('project_id', projectId)
        .order('moved_at', { ascending: false });
      if (error) throw error;
      return data as ClaimMove[];
    },
  });

  if (isLoading) return null;

  return (
    <div className="border rounded-lg bg-card overflow-hidden animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Claim Move Audit Trail</span>
          <span className="text-xs text-muted-foreground">— {projectName}</span>
          <Badge variant="secondary" className="text-[10px] ml-1">{moves.length} move{moves.length !== 1 ? 's' : ''}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="border-t">
          {moves.length === 0 ? (
            <p className="text-sm text-muted-foreground px-4 py-6 text-center">No claim movements recorded for this project.</p>
          ) : (
            <div className="max-h-[250px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs">Date Moved</TableHead>
                    <TableHead className="text-xs">Claim Type</TableHead>
                    <TableHead className="text-xs">Original Date</TableHead>
                    <TableHead className="text-xs"></TableHead>
                    <TableHead className="text-xs">New Date</TableHead>
                    <TableHead className="text-xs text-right">Days Delta</TableHead>
                    <TableHead className="text-xs">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moves.map(move => {
                    const delta = move.days_delta || 0;
                    return (
                      <TableRow key={move.id}>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {format(new Date(move.moved_at), 'dd MMM yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{move.claim_type}</TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {format(new Date(move.old_date + 'T00:00:00'), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-center">
                          <ArrowRight className="h-3 w-3 text-muted-foreground inline" />
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {format(new Date(move.new_date + 'T00:00:00'), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className={cn(
                          "text-xs font-semibold text-right tabular-nums",
                          delta > 0 ? "text-destructive" : delta < 0 ? "text-emerald-600" : "text-muted-foreground"
                        )}>
                          {delta > 0 ? `+${delta}` : delta} day{Math.abs(delta) !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-xs">
                          {move.reason_category ? (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {move.reason_category === 'Custom' ? move.reason_text : move.reason_category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
