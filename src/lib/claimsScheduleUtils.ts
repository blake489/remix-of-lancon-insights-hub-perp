import { addDays, addWeeks, format } from 'date-fns';
import { defaultSchedules, ClaimScheduleType, StageRow } from '@/components/projects/ClaimsScheduleTable';

export interface ProjectedClaim {
  projectId: string;
  stage: string;
  percent: number;
  amountExGst: number;
  amountIncGst: number;
  monthKey: string;
  projectedDate: Date;
}

/**
 * Given a project's start_date (contract sign), schedule type, custom timeframes,
 * and contract value, compute projected claim dates and amounts.
 */
export function computeProjectedClaims(
  projectId: string,
  startDate: string,
  scheduleType: ClaimScheduleType,
  customTimeframes: Record<string, number>,
  contractValueExGst: number,
): ProjectedClaim[] {
  if (!startDate || contractValueExGst <= 0) return [];

  const baseRows = defaultSchedules[scheduleType] || defaultSchedules.standard;
  const rows = baseRows.map(r => ({
    ...r,
    timeValue: r.stage in customTimeframes ? customTimeframes[r.stage] : r.timeValue,
  }));

  const results: ProjectedClaim[] = [];
  const base = new Date(startDate + 'T00:00:00');
  let cumulativeDays = 0;

  for (const row of rows) {
    // Accumulate time
    const daysToAdd = row.timeUnit === 'days' ? row.timeValue : row.timeValue * 7;
    cumulativeDays += daysToAdd;

    if (row.percent <= 0) continue; // Skip Contract Sign (0%)

    const projectedDate = addDays(base, cumulativeDays);
    const amountExGst = contractValueExGst * (row.percent / 100);

    results.push({
      projectId,
      stage: row.stage,
      percent: row.percent,
      amountExGst,
      amountIncGst: amountExGst * 1.1,
      monthKey: format(projectedDate, 'yyyy-MM'),
      projectedDate,
    });
  }

  return results;
}
