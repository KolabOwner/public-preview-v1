import { BaseSectionRenderer } from './base-renderer';

/**
 * Summary section renderer for resume PDF
 */
export class SummaryRenderer extends BaseSectionRenderer {
  /**
   * Render the summary section
   */
  render(summary: string): number {
    if (!summary || summary.trim().length === 0) return this.yPosition;
    
    this.addSectionHeading('Summary');
    
    this.yPosition = this.addText(
      summary,
      this.config.margins.left,
      this.yPosition,
      {
        font: this.config.fonts.body,
        color: this.config.colors.text,
        maxWidth: this.contentWidth
      }
    );
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}