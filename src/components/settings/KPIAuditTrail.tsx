import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KPISettingsAudit } from '@/hooks/useKPISettings';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { History } from 'lucide-react';

interface KPIAuditTrailProps {
  auditRecords: KPISettingsAudit[];
  isLoading: boolean;
}

export function KPIAuditTrail({ auditRecords, isLoading }: KPIAuditTrailProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading audit history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Audit Trail
        </CardTitle>
        <CardDescription>
          History of all KPI settings changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No changes have been recorded yet.
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Revenue Target</TableHead>
                  <TableHead>GP% Target</TableHead>
                  <TableHead>Overhead %</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm">
                        {format(new Date(record.created_at), 'dd MMM yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(record.created_at), 'HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {record.changed_by_email || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatCurrency(record.monthly_revenue_target)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.gp_percent_target}%
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.overhead_percent}%
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-sm truncate" title={record.change_reason || ''}>
                        {record.change_reason || '-'}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
