import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { KPISettings, useUpdateKPISettings } from '@/hooks/useKPISettings';
import { formatCurrency } from '@/lib/formatters';
import { Settings, DollarSign, Percent, Target, AlertTriangle } from 'lucide-react';

const kpiSettingsSchema = z.object({
  monthly_revenue_target: z.coerce.number().min(0, 'Must be positive'),
  gp_percent_target: z.coerce.number().min(0).max(100, 'Must be 0-100'),
  gp_threshold_green: z.coerce.number().min(0).max(100, 'Must be 0-100'),
  gp_threshold_orange: z.coerce.number().min(0).max(100, 'Must be 0-100'),
  revenue_threshold_green: z.coerce.number().min(0, 'Must be positive'),
  revenue_threshold_orange: z.coerce.number().min(0, 'Must be positive'),
  change_reason: z.string().min(5, 'Please provide a reason for this change (min 5 characters)'),
});

type KPISettingsFormData = z.infer<typeof kpiSettingsSchema>;

interface KPISettingsFormProps {
  settings: KPISettings;
  isAdmin: boolean;
}

export function KPISettingsForm({ settings, isAdmin }: KPISettingsFormProps) {
  const updateSettings = useUpdateKPISettings();

  const form = useForm<KPISettingsFormData>({
    resolver: zodResolver(kpiSettingsSchema),
    defaultValues: {
      monthly_revenue_target: settings.monthly_revenue_target,
      gp_percent_target: settings.gp_percent_target,
      overhead_percent: settings.overhead_percent,
      gp_threshold_green: settings.gp_threshold_green,
      gp_threshold_orange: settings.gp_threshold_orange,
      revenue_threshold_green: settings.revenue_threshold_green,
      revenue_threshold_orange: settings.revenue_threshold_orange,
      change_reason: '',
    },
  });

  const onSubmit = (data: KPISettingsFormData) => {
    updateSettings.mutate({
      settingsId: settings.id,
      input: {
        monthly_revenue_target: data.monthly_revenue_target,
        gp_percent_target: data.gp_percent_target,
        overhead_percent: data.overhead_percent,
        gp_threshold_green: data.gp_threshold_green,
        gp_threshold_orange: data.gp_threshold_orange,
        revenue_threshold_green: data.revenue_threshold_green,
        revenue_threshold_orange: data.revenue_threshold_orange,
        change_reason: data.change_reason,
      },
    }, {
      onSuccess: () => {
        form.reset({ ...data, change_reason: '' });
      },
    });
  };

  const calculatedOverhead = (form.watch('monthly_revenue_target') * form.watch('overhead_percent')) / 100;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Magic Equation Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Magic Equation Targets
            </CardTitle>
            <CardDescription>
              Core business performance targets used for KPI calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="monthly_revenue_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Revenue Target (ex-GST)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1000"
                      {...field}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormDescription>
                    Currently: {formatCurrency(field.value)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gp_percent_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    GP% Target
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      {...field}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormDescription>
                    Target gross profit percentage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overhead_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Overhead Percentage
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      disabled={!isAdmin}
                    />
                  </FormControl>
                  <FormDescription>
                    Monthly overheads: {formatCurrency(calculatedOverhead)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Traffic Light Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Traffic Light Thresholds
            </CardTitle>
            <CardDescription>
              Define when KPIs show green, orange, or red status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GP Thresholds */}
            <div>
              <h4 className="font-medium mb-4">Gross Profit % Thresholds</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gp_threshold_green"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        Green Threshold (≥)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          disabled={!isAdmin}
                        />
                      </FormControl>
                      <FormDescription>GP% at or above this is green</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gp_threshold_orange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500 dark:bg-amber-400" />
                        Orange Threshold (≥)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          disabled={!isAdmin}
                        />
                      </FormControl>
                      <FormDescription>GP% at or above this (but below green) is orange. Below is red.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Revenue Thresholds */}
            <div>
              <h4 className="font-medium mb-4">Revenue Thresholds</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="revenue_threshold_green"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        Green Threshold (≥)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10000"
                          {...field}
                          disabled={!isAdmin}
                        />
                      </FormControl>
                      <FormDescription>
                        {formatCurrency(field.value)} or above is green
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="revenue_threshold_orange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-amber-500 dark:bg-amber-400" />
                        Orange Threshold (≥)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10000"
                          {...field}
                          disabled={!isAdmin}
                        />
                      </FormControl>
                      <FormDescription>
                        {formatCurrency(field.value)} to green threshold is orange. Below is red.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Reason & Submit */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Save Changes</CardTitle>
              <CardDescription>
                All changes are tracked in the audit trail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="change_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe why these settings are being updated..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateSettings.isPending || !form.formState.isDirty}
              >
                {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isAdmin && (
          <Card className="border-muted">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                You do not have administrator permissions to modify these settings.
                Contact an admin to make changes.
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
