import { BaseSectionRenderer } from './base-renderer';
import { formatDateRange } from '../../utils/date-formatter';
import { parseBulletPoints } from '../../utils/text-formatter';

/**
 * Experience section renderer for resume PDF
 */
export class ExperienceRenderer extends BaseSectionRenderer {
  /**
   * Render the experience section
   */
  render(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return this.yPosition;
    
    this.addSectionHeading('Experience');
    
    experiences.forEach((exp, index) => {
      this.checkPageOverflow(60);
      
      // Company and title on same line
      const leftText = exp.company || '';
      const rightText = exp.title || exp.role || '';
      
      if (leftText || rightText) {
        // Left side (company)
        if (leftText) {
          this.addText(leftText, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.subheading,
            color: this.config.colors.black
          });
        }
        
        // Right side (title)
        if (rightText) {
          this.setFont(this.config.fonts.subheading);
          const textWidth = this.doc.getTextWidth(rightText);
          this.addText(
            rightText,
            this.pageWidth - this.config.margins.right - textWidth,
            this.yPosition,
            {
              font: this.config.fonts.subheading,
              color: this.config.colors.black
            }
          );
        }
        
        this.yPosition += this.config.fonts.subheading.size * this.config.spacing.lineHeight;
      }
      
      // Date and location line
      const dateText = formatDateRange(exp.startDate, exp.endDate, exp.current);
      const hasSecondLine = dateText || exp.location;
      
      if (hasSecondLine) {
        // Date (left side)
        if (dateText) {
          this.addText(dateText, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          });
        }
        
        // Location (right side)
        if (exp.location) {
          this.setFont(this.config.fonts.accent);
          const locationWidth = this.doc.getTextWidth(exp.location);
          this.addText(
            exp.location,
            this.pageWidth - this.config.margins.right - locationWidth,
            this.yPosition,
            {
              font: this.config.fonts.accent,
              color: this.config.colors.gray
            }
          );
        }
        
        this.yPosition += this.config.fonts.accent.size * this.config.spacing.lineHeight;
      }
      
      // Description bullets
      if (exp.description) {
        const bullets = parseBulletPoints(exp.description);
        const bulletIndent = 12; // 0.75rem = 12pt
        
        bullets.forEach((bullet) => {
          this.checkPageOverflow(30);
          
          // Add bullet point
          this.addText('•', this.config.margins.left, this.yPosition, {
            font: this.config.fonts.body,
            color: this.config.colors.text
          });
          
          // Add bullet text
          this.yPosition = this.addText(
            bullet,
            this.config.margins.left + bulletIndent,
            this.yPosition,
            {
              font: this.config.fonts.body,
              color: this.config.colors.text,
              maxWidth: this.contentWidth - bulletIndent - 8
            }
          );
          
          this.yPosition += 2; // Small spacing between bullets
        });
      }
      
      // Add spacing between experiences
      if (index < experiences.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}