/**
 * Shared GP% threshold utilities.
 * Default values match the DB defaults; components should pass
 * the live values from useKPISettings when available.
 */

export interface GpThresholds {
  green: number;  // GP% >= green → green
  orange: number; // GP% >= orange → amber/warning
  // below orange → red/danger
}

export const DEFAULT_GP_THRESHOLDS: GpThresholds = { green: 17, orange: 12 };

export function gpTextColor(gp: number, t: GpThresholds = DEFAULT_GP_THRESHOLDS) {
  if (gp >= t.green) return 'text-emerald-600';
  if (gp >= t.orange) return 'text-amber-600';
  return 'text-red-600';
}

export function gpSemanticColor(gp: number, t: GpThresholds = DEFAULT_GP_THRESHOLDS) {
  if (gp >= t.green) return 'text-success';
  if (gp >= t.orange) return 'text-warning';
  return 'text-danger';
}

export function gpStatus(gp: number, t: GpThresholds = DEFAULT_GP_THRESHOLDS): 'success' | 'warning' | 'danger' {
  if (gp >= t.green) return 'success';
  if (gp >= t.orange) return 'warning';
  return 'danger';
}

export function gpBgColor(gp: number, t: GpThresholds = DEFAULT_GP_THRESHOLDS) {
  if (gp >= t.green) return 'bg-emerald-500';
  if (gp >= t.orange) return 'bg-amber-500';
  return 'bg-red-500';
}
