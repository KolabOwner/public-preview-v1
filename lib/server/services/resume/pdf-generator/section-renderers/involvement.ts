import { BaseSectionRenderer } from './base-renderer';
import { formatDateRange } from '../../utils/date-formatter';
import { parseBulletPoints } from '../../utils/text-formatter';

/**
 * Involvement section renderer for resume PDF
 */
export class InvolvementRenderer extends BaseSectionRenderer {
  /**
   * Render the involvement section
   */
  render(involvement: any[]): number {
    if (!involvement || involvement.length === 0) return this.yPosition;
    
    this.addSectionHeading('Involvement');
    
    involvement.forEach((inv, index) => {
      this.checkPageOverflow(50);
      
      // Role and organization
      const role = inv.role || '';
      const organization = inv.organization || '';
      
      if (role || organization) {
        // Left side (role)
        if (role) {
          this.addText(role, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.subheading,
            color: this.config.colors.black
          });
        }
        
        // Right side (organization)
        if (organization) {
          this.setFont(this.config.fonts.subheading);
          const orgWidth = this.doc.getTextWidth(organization);
          this.addText(
            organization,
            this.pageWidth - this.config.margins.right - orgWidth,
            this.yPosition,
            {
              font: this.config.fonts.subheading,
              color: this.config.colors.black
            }
          );
        }
        
        this.yPosition += this.config.fonts.subheading.size * this.config.spacing.lineHeight;
      }
      
      // Date and location
      const dateText = formatDateRange(inv.startDate, inv.endDate, inv.current);
      
      if (dateText || inv.location) {
        // Date (left side)
        if (dateText) {
          this.addText(dateText, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          });
        }
        
        // Location (right side)
        if (inv.location) {
          this.setFont(this.config.fonts.accent);
          const locationWidth = this.doc.getTextWidth(inv.location);
          this.addText(
            inv.location,
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
      
      // Description as bullet points
      if (inv.description) {
        const bullets = parseBulletPoints(inv.description);
        const bulletIndent = 12;
        
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
          
          this.yPosition += 2;
        });
      }
      
      // Add spacing between involvement entries
      if (index < involvement.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}