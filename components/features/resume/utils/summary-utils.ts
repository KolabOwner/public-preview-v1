// components/resume/utils/summary-utils.ts
import type { SummaryData } from '@/lib/client/stores/types';

export const summaryDataToString = (summaryData: SummaryData): string => {
  const parts = [
    summaryData.summary,
    summaryData.positionHighlight ? `Position: ${summaryData.position}` : '',
    summaryData.skillsHighlight ? `Skills: ${summaryData.skillsHighlight}` : ''
  ].filter(Boolean);

  return parts.join('\n\n');
};

export const stringToSummaryData = (summaryString: string): SummaryData => {
  if (typeof summaryString === 'object' && summaryString !== null) {
    return summaryString as unknown as SummaryData;
  }

  const parts = summaryString.split('\n\n');
  let position = '';
  let skillsHighlight = '';
  let positionHighlight = false;

  parts.forEach(part => {
    if (part.startsWith('Position: ')) {
      position = part.replace('Position: ', '');
      positionHighlight = true;
    } else if (part.startsWith('Skills: ')) {
      skillsHighlight = part.replace('Skills: ', '');
    }
  });

  return {
    summary: parts[0] || summaryString || '',
    positionHighlight,
    position,
    skillsHighlight
  };
};