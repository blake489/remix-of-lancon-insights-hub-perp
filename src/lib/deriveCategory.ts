import { ProjectCategory } from '@/hooks/useProjects';

/**
 * Auto-derive project category based on lifecycle:
 * - Pre Construction: contract signed / deposit paid, but site start hasn't begun
 * - Construction: site start date exists and is in the past (or today), up until Handover
 * - Handover: current stage is 'Handover' or claim_stage_statuses has Handover as 'claimed'
 */
export function deriveCategory(opts: {
  siteStartDate?: string | null;
  claimStageStatuses?: Record<string, string>;
  currentStage?: string | null;
}): ProjectCategory {
  const { siteStartDate, claimStageStatuses = {}, currentStage } = opts;

  // Check if Handover stage has been reached
  const handoverStatus = claimStageStatuses['Handover'] || claimStageStatuses['handover'];
  if (
    handoverStatus === 'claimed' ||
    handoverStatus === 'confirmed' ||
    currentStage?.toLowerCase() === 'handover'
  ) {
    return 'handover';
  }

  // Check if site has started
  if (siteStartDate) {
    const start = new Date(siteStartDate + 'T00:00:00');
    if (start <= new Date()) {
      return 'construction';
    }
  }

  return 'pre_construction';
}
