import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type ClaimScheduleType = 'standard' | 'retaining_wall';

export interface StageRow {
  stage: string;
  percent: number;
  timeValue: number;
  timeUnit: 'days' | 'weeks';
}

export const defaultSchedules: Record<ClaimScheduleType, StageRow[]> = {
  standard: [
    { stage: 'Contract Sign', percent: 0, timeValue: 0, timeUnit: 'days' },
    { stage: 'Deposit', percent: 5, timeValue: 7, timeUnit: 'days' },
    { stage: 'Site Start', percent: 0, timeValue: 0, timeUnit: 'days' },
    { stage: 'Slab/Base Stage', percent: 15, timeValue: 5, timeUnit: 'weeks' },
    { stage: 'Frame Stage', percent: 20, timeValue: 5, timeUnit: 'weeks' },
    { stage: 'Enclosed Stage', percent: 25, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'Fixing Stage', percent: 20, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'PC', percent: 10, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'Handover', percent: 5, timeValue: 2, timeUnit: 'weeks' },
  ],
  retaining_wall: [
    { stage: 'Contract Sign', percent: 0, timeValue: 0, timeUnit: 'days' },
    { stage: 'Deposit', percent: 5, timeValue: 7, timeUnit: 'days' },
    { stage: 'Site Start', percent: 0, timeValue: 0, timeUnit: 'days' },
    { stage: 'Retaining Wall', percent: 7.5, timeValue: 3, timeUnit: 'weeks' },
    { stage: 'Slab/Base Stage', percent: 15, timeValue: 5, timeUnit: 'weeks' },
    { stage: 'Frame Stage', percent: 22.5, timeValue: 5, timeUnit: 'weeks' },
    { stage: 'Enclosed Stage', percent: 25, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'Fixing Stage', percent: 10, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'PC', percent: 10, timeValue: 8, timeUnit: 'weeks' },
    { stage: 'Handover', percent: 5, timeValue: 2, timeUnit: 'weeks' },
  ],
};

interface ClaimsScheduleTableProps {
  scheduleType: ClaimScheduleType;
  onScheduleTypeChange: (type: ClaimScheduleType) => void;
  contractValueExGst: number;
  contractSignDate?: string;
  onContractSignDateChange?: (date: string) => void;
  siteStartDate?: string;
  onSiteStartDateChange?: (date: string) => void;
  customTimeframes?: Record<string, number>;
  onTimeframeChange?: (stage: string, value: number) => void;
}

const formatCurrency = (val: number) =>
  val === 0 ? '—' : `$${val.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function cumulativeWeeks(rows: StageRow[]): number[] {
  const cumulative: number[] = [];
  let total = 0;
  for (const row of rows) {
    if (row.stage === 'Site Start') {
      cumulative.push(total); // Site Start doesn't add time — it resets the baseline
      continue;
    }
    const weeks = row.timeUnit === 'days' ? row.timeValue / 7 : row.timeValue;
    total += weeks;
    cumulative.push(total);
  }
  return cumulative;
}

export function ClaimsScheduleTable({
  scheduleType,
  onScheduleTypeChange,
  contractValueExGst,
  contractSignDate,
  onContractSignDateChange,
  siteStartDate,
  onSiteStartDateChange,
  customTimeframes,
  onTimeframeChange,
}: ClaimsScheduleTableProps) {
  const baseRows = defaultSchedules[scheduleType];
  const rows = baseRows.map(r => ({
    ...r,
    timeValue: customTimeframes && r.stage in customTimeframes ? customTimeframes[r.stage] : r.timeValue,
  }));
  const totalPercent = rows.reduce((s, r) => s + r.percent, 0);
  const cumWeeks = cumulativeWeeks(rows);

  const renderDatePicker = (label: string, value?: string, onChange?: (date: string) => void) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 text-xs justify-start font-normal px-2",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {value
            ? format(new Date(value + 'T00:00:00'), 'dd MMM yyyy')
            : `Pick ${label}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={value ? new Date(value + 'T00:00:00') : undefined}
          onSelect={(d) => {
            if (d) onChange?.(format(d, 'yyyy-MM-dd'));
          }}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <fieldset className="space-y-3 border-2 border-amber-400/30 bg-amber-500/[0.03] rounded-lg px-3 py-3 ring-1 ring-amber-400/10 transition-all duration-300">
      <legend className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-1.5">📅 Claims Schedule</legend>

      <div className="space-y-1">
        <Label className="text-[11px] font-medium text-muted-foreground">Schedule Type *</Label>
        <Select value={scheduleType} onValueChange={(v) => onScheduleTypeChange(v as ClaimScheduleType)}>
          <SelectTrigger className="h-9 text-sm font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard (No Retaining Wall)</SelectItem>
            <SelectItem value="retaining_wall">With Retaining Wall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border/60 overflow-hidden bg-card/60">
        <Table>
          <TableHeader>
            <TableRow className="bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/40 dark:border-amber-800/30">
              <TableHead className="font-semibold text-xs">Stage</TableHead>
              <TableHead className="text-right font-semibold text-xs">Timeframe</TableHead>
              <TableHead className="text-right font-semibold text-xs">Cum. Weeks</TableHead>
              <TableHead className="text-right font-semibold text-xs">%</TableHead>
              <TableHead className="text-right font-semibold text-xs">Ex GST</TableHead>
              <TableHead className="text-right font-semibold text-xs">Inc GST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const exGst = contractValueExGst * (row.percent / 100);
              const incGst = exGst * 1.1;
              const isSiteStart = row.stage === 'Site Start';
              const isContractSign = row.stage === 'Contract Sign';
              return (
                <TableRow
                  key={row.stage}
                  className={cn(
                    "transition-colors",
                    isSiteStart && 'bg-primary/5 border-l-2 border-l-primary/40',
                    isContractSign && 'border-l-2 border-l-amber-400/40',
                  )}
                >
                  <TableCell className="font-medium text-sm">
                    {row.stage}
                    {isSiteStart && (
                      <span className="text-[10px] text-muted-foreground ml-1">(claims base date)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isContractSign ? (
                      renderDatePicker('contract date', contractSignDate, onContractSignDateChange)
                    ) : isSiteStart ? (
                      renderDatePicker('site start', siteStartDate, onSiteStartDateChange)
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <Input
                          type="number"
                          min={0}
                          className="w-16 h-7 text-xs text-right tabular-nums p-1"
                          value={row.timeValue}
                          onChange={e => onTimeframeChange?.(row.stage, parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {row.timeUnit}
                        </span>
                        <span className="text-xs text-muted-foreground/60 whitespace-nowrap">
                          ({row.timeUnit === 'days' ? row.timeValue : row.timeValue * 7}d)
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground text-xs">
                    {isSiteStart ? '—' : cumWeeks[i] === 0 ? '—' : `${Math.round(cumWeeks[i] * 10) / 10} wks`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{row.percent > 0 ? `${row.percent}%` : '—'}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{row.percent > 0 ? formatCurrency(exGst) : '—'}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{row.percent > 0 ? formatCurrency(incGst) : '—'}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-amber-50/40 dark:bg-amber-950/10 font-semibold border-t-2 border-amber-200/40 dark:border-amber-800/30">
              <TableCell className="text-sm">Total</TableCell>
              <TableCell />
              <TableCell className="text-right tabular-nums text-xs">
                {`${Math.round(cumWeeks[cumWeeks.length - 1] * 10) / 10} wks`}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">{totalPercent}%</TableCell>
              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(contractValueExGst)}</TableCell>
              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(contractValueExGst * 1.1)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </fieldset>
  );
}
