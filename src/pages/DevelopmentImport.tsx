import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface ParsedRow {
  project_name: string;
  current_value: number;
  current_loan: number;
  funds_in_offset: number;
  grv: number;
  forecast_margin_on_costs: number;
}

const REQUIRED_COLUMNS = ['project_name', 'current_value', 'current_loan', 'funds_in_offset', 'grv', 'forecast_margin_on_costs'];

function parseCSV(text: string): { rows: ParsedRow[]; error?: string } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], error: 'File must have a header row and at least one data row.' };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
  if (missing.length > 0) return { rows: [], error: `Missing required columns: ${missing.join(', ')}` };

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < headers.length) continue;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx]; });
    if (!obj.project_name) continue;
    rows.push({
      project_name: obj.project_name,
      current_value: parseFloat(obj.current_value) || 0,
      current_loan: parseFloat(obj.current_loan) || 0,
      funds_in_offset: parseFloat(obj.funds_in_offset) || 0,
      grv: parseFloat(obj.grv) || 0,
      forecast_margin_on_costs: parseFloat(obj.forecast_margin_on_costs) || 0,
    });
  }
  return { rows };
}

export default function DevelopmentImport() {
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResult(null);
    setParseError(null);
    setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows, error } = parseCSV(text);
      if (error) { setParseError(error); return; }
      setParsed(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    try {
      // Fetch existing projects to determine insert vs update
      const { data: existing } = await supabase
        .from('development_projects')
        .select('id, project_name');
      const existingMap = new Map((existing || []).map(p => [p.project_name, p.id]));

      let inserted = 0;
      let updated = 0;

      for (const row of parsed) {
        const existingId = existingMap.get(row.project_name);
        if (existingId) {
          const { error } = await supabase
            .from('development_projects')
            .update({
              current_value: row.current_value,
              current_loan: row.current_loan,
              funds_in_offset: row.funds_in_offset,
              grv: row.grv,
              forecast_margin_on_costs: row.forecast_margin_on_costs,
            })
            .eq('id', existingId);
          if (error) throw error;
          updated++;
        } else {
          const { error } = await supabase
            .from('development_projects')
            .insert({
              project_name: row.project_name,
              current_value: row.current_value,
              current_loan: row.current_loan,
              funds_in_offset: row.funds_in_offset,
              grv: row.grv,
              forecast_margin_on_costs: row.forecast_margin_on_costs,
            });
          if (error) throw error;
          inserted++;
        }
      }

      setResult({ inserted, updated });
      queryClient.invalidateQueries({ queryKey: ['development_projects'] });
      toast({ title: 'Import complete', description: `${inserted} inserted, ${updated} updated.` });
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setParsed(null);
    setParseError(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <DashboardLayout>
      <div className="min-h-full bg-background">
        <div className="border-b border-border/40 bg-background">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <h1 className="text-xl font-semibold text-foreground">Development Data Import</h1>
            <p className="text-sm text-muted-foreground mt-1">Upload a CSV to update development project data</p>
          </div>
        </div>

        <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upload CSV</CardTitle>
              <CardDescription>
                Required columns: project_name, current_value, current_loan, funds_in_offset, grv, forecast_margin_on_costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
                {parsed && <span className="text-sm text-muted-foreground">{parsed.length} rows parsed</span>}
              </div>
              {parseError && <p className="mt-3 text-sm text-destructive">{parseError}</p>}
            </CardContent>
          </Card>

          {/* Preview */}
          {parsed && parsed.length > 0 && !result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Preview (first 5 rows)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
                    <Button size="sm" onClick={handleImport} disabled={importing}>
                      {importing ? 'Importing…' : `Import ${parsed.length} rows`}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead className="text-right">Current Value</TableHead>
                      <TableHead className="text-right">Current Loan</TableHead>
                      <TableHead className="text-right">Offset</TableHead>
                      <TableHead className="text-right">GRV</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.project_name}</TableCell>
                        <TableCell className="text-right">{row.current_value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.current_loan.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.funds_in_offset.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.grv.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{row.forecast_margin_on_costs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-success mb-3" />
                <p className="text-foreground font-semibold">Import Complete</p>
                <p className="text-sm text-muted-foreground mt-1">{result.inserted} inserted, {result.updated} updated.</p>
                <Button className="mt-4" size="sm" onClick={reset}>Import Another File</Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
