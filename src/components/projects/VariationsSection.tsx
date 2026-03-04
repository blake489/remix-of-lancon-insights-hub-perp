import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Variation {
  description: string;
  amount: number;
  dueDate?: string; // yyyy-MM-dd
}

interface VariationsSectionProps {
  variations: Variation[];
  onChange: (variations: Variation[]) => void;
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

export function VariationsSection({ variations, onChange }: VariationsSectionProps) {
  const total = variations.reduce((s, v) => s + (v.amount || 0), 0);

  const updateRow = (index: number, field: keyof Variation, value: string) => {
    const updated = [...variations];
    if (field === 'amount') {
      updated[index] = { ...updated[index], amount: parseFloat(value) || 0 };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    onChange(updated);
  };

  const addRow = () => onChange([...variations, { description: '', amount: 0, dueDate: '' }]);

  const removeRow = (index: number) => onChange(variations.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-muted-foreground leading-snug">
        Variations are <span className="font-semibold">not</span> added to the schedule of payments — each generates its own tile in Claims Papi.
      </p>

      {variations.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_120px_130px_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>Description</span>
            <span className="text-right">Amount (ex GST)</span>
            <span className="text-center">Due Date</span>
            <span />
          </div>
          {variations.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_130px_36px] gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
              <Input
                placeholder="e.g. Extra bathroom tiling"
                value={v.description}
                onChange={e => updateRow(i, 'description', e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                step="0.01"
                value={v.amount || ''}
                onChange={e => updateRow(i, 'amount', e.target.value)}
                className="text-sm text-right tabular-nums"
                placeholder="0"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-8 text-xs justify-start font-normal px-2 w-full",
                      !v.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {v.dueDate
                      ? format(new Date(v.dueDate + 'T00:00:00'), 'dd MMM yyyy')
                      : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
                  <Calendar
                    mode="single"
                    selected={v.dueDate ? new Date(v.dueDate + 'T00:00:00') : undefined}
                    onSelect={(d) => {
                      if (d) updateRow(i, 'dueDate', format(d, 'yyyy-MM-dd'));
                    }}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeRow(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {variations.length > 0 && (
            <div className="grid grid-cols-[1fr_120px_130px_36px] gap-2 pt-1 border-t border-border">
              <span className="text-sm font-semibold text-right pr-2">Variations Total</span>
              <span className="text-sm font-bold text-right tabular-nums pr-3">
                {total >= 0 ? '+' : ''}{fmt(total)}
              </span>
              <span />
              <span />
            </div>
          )}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add Variation
      </Button>
    </div>
  );
}
