import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMonthName } from '@/lib/formatters';
import { Calendar, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  selectedMonth: string;
  selectedFortnight: 1 | 2;
  availableMonths: string[];
  onMonthChange: (month: string) => void;
  onFortnightChange: (fortnight: 1 | 2) => void;
}

export function DashboardFilters({
  selectedMonth,
  selectedFortnight,
  availableMonths,
  onMonthChange,
  onFortnightChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Period:</span>
      </div>
      
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map(month => (
            <SelectItem key={month} value={month}>
              {getMonthName(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={String(selectedFortnight)} 
        onValueChange={(v) => onFortnightChange(parseInt(v) as 1 | 2)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Fortnight 1 (1-14)</SelectItem>
          <SelectItem value="2">Fortnight 2 (15-End)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
