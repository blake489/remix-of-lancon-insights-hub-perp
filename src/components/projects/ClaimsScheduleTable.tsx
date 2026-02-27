import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type ClaimScheduleType = 'standard' | 'retaining_wall';

const schedules: Record<ClaimScheduleType, { stage: string; percent: number }[]> = {
  standard: [
    { stage: 'Deposit', percent: 5 },
    { stage: 'Slab/Base Stage', percent: 15 },
    { stage: 'Frame Stage', percent: 20 },
    { stage: 'Enclosed Stage', percent: 25 },
    { stage: 'Fixing Stage', percent: 20 },
    { stage: 'PC', percent: 15 },
  ],
  retaining_wall: [
    { stage: 'Deposit', percent: 5 },
    { stage: 'Retaining Wall', percent: 7.5 },
    { stage: 'Slab/Base Stage', percent: 15 },
    { stage: 'Frame Stage', percent: 22.5 },
    { stage: 'Enclosed Stage', percent: 25 },
    { stage: 'Fixing Stage', percent: 15 },
    { stage: 'PC', percent: 10 },
  ],
};

interface ClaimsScheduleTableProps {
  scheduleType: ClaimScheduleType;
  onScheduleTypeChange: (type: ClaimScheduleType) => void;
  contractValueExGst: number;
}

const formatCurrency = (val: number) =>
  val === 0 ? '—' : `$${val.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ClaimsScheduleTable({
  scheduleType,
  onScheduleTypeChange,
  contractValueExGst,
}: ClaimsScheduleTableProps) {
  const rows = schedules[scheduleType];
  const totalPercent = rows.reduce((s, r) => s + r.percent, 0);

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Claims Schedule
      </legend>

      <div className="space-y-2">
        <Label>Schedule Type *</Label>
        <Select value={scheduleType} onValueChange={(v) => onScheduleTypeChange(v as ClaimScheduleType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (No Retaining Wall)</SelectItem>
            <SelectItem value="retaining_wall">With Retaining Wall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="text-right font-semibold">%</TableHead>
              <TableHead className="text-right font-semibold">Ex GST</TableHead>
              <TableHead className="text-right font-semibold">Inc GST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const exGst = contractValueExGst * (row.percent / 100);
              const incGst = exGst * 1.1;
              return (
                <TableRow key={row.stage}>
                  <TableCell className="font-medium">{row.stage}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.percent}%</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(exGst)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(incGst)}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/30 font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right tabular-nums">{totalPercent}%</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(contractValueExGst)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(contractValueExGst * 1.1)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </fieldset>
  );
}
