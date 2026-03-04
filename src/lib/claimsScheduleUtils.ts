import { addDays, format } from 'date-fns';
import { defaultSchedules, ClaimScheduleType } from '@/components/projects/ClaimsScheduleTable';
import { Variation } from '@/components/projects/VariationsSection';

export interface ProjectedClaim {
  projectId: string;
  stage: string;
  percent: number;
  amountExGst: number;
  amountIncGst: number;
  monthKey: string;
  projectedDate: Date;
  status: string;
}

/**
 * Given a project's contract sign date, site start date, schedule type, custom timeframes,
 * and contract value, compute projected claim dates and amounts.
 * 
 * - Deposit is relative to contractSignDate.
 * - All stages after Site Start are relative to siteStartDate.
 */
export function computeProjectedClaims(
  projectId: string,
  startDate: string,
  scheduleType: ClaimScheduleType,
  customTimeframes: Record<string, number>,
  contractValueExGst: number,
  siteStartDate?: string | null,
  stageStatuses?: Record<string, string>,
): ProjectedClaim[] {
  if (!startDate || contractValueExGst <= 0) return [];

  const baseRows = defaultSchedules[scheduleType] || defaultSchedules.standard;
  const rows = baseRows.map(r => ({
    ...r,
    timeValue: r.stage in customTimeframes ? customTimeframes[r.stage] : r.timeValue,
  }));

  const results: ProjectedClaim[] = [];
  const contractBase = new Date(startDate + 'T00:00:00');
  const siteBase = siteStartDate ? new Date(siteStartDate + 'T00:00:00') : null;
  
  let cumulativeDaysFromContract = 0;
  let cumulativeDaysFromSite = 0;
  let passedSiteStart = false;

  for (const row of rows) {
    if (row.stage === 'Site Start') {
      passedSiteStart = true;
      continue; // Site Start is a date marker, not a claim
    }

    const daysToAdd = row.timeUnit === 'days' ? row.timeValue : row.timeValue * 7;

    if (!passedSiteStart) {
      // Before Site Start — relative to contract sign date
      cumulativeDaysFromContract += daysToAdd;
    } else {
      // After Site Start — relative to site start date
      cumulativeDaysFromSite += daysToAdd;
    }

    if (row.percent <= 0) continue; // Skip Contract Sign (0%)

    let projectedDate: Date;
    if (!passedSiteStart) {
      projectedDate = addDays(contractBase, cumulativeDaysFromContract);
    } else if (siteBase) {
      projectedDate = addDays(siteBase, cumulativeDaysFromSite);
    } else {
      // No site start date set — fall back to contract base with combined days
      projectedDate = addDays(contractBase, cumulativeDaysFromContract + cumulativeDaysFromSite);
    }

    const amountExGst = contractValueExGst * (row.percent / 100);

    results.push({
      projectId,
      stage: row.stage,
      percent: row.percent,
      amountExGst,
      amountIncGst: amountExGst * 1.1,
      monthKey: format(projectedDate, 'yyyy-MM'),
      projectedDate,
      status: stageStatuses?.[row.stage] || 'planned',
    });
  }

  return results;
}
