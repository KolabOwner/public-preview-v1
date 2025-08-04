import { BaseSectionRenderer } from './base-renderer';
import { formatLocation } from '../../utils/text-formatter';

/**
 * Header section renderer for resume PDF
 */
export class HeaderRenderer extends BaseSectionRenderer {
  /**
   * Render the header section with contact information
   */
  render(contactInfo: any): number {
    if (!contactInfo) return this.yPosition;
    
    // Name
    if (contactInfo.fullName) {
      this.yPosition = this.addText(
        contactInfo.fullName.toUpperCase(),
        this.pageWidth / 2,
        this.yPosition,
        {
          font: this.config.fonts.name,
          color: this.config.colors.black,
          align: 'center'
        }
      );
    }
    
    // Contact info (centered)
    const contactItems = [];
    
    const location = formatLocation(
      contactInfo.location,
      contactInfo.city,
      contactInfo.state,
      contactInfo.country
    );
    
    if (location) contactItems.push(location);
    if (contactInfo.email) contactItems.push(contactInfo.email);
    if (contactInfo.phone) contactItems.push(contactInfo.phone);
    
    if (contactInfo.linkedin) {
      const linkedinHandle = contactInfo.linkedin.replace(/^.*\/in\//, '');
      contactItems.push(`linkedin.com/in/${linkedinHandle}`);
    }
    
    if (contactInfo.website) contactItems.push(contactInfo.website);
    
    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      this.yPosition = this.addText(
        contactText,
        this.pageWidth / 2,
        this.yPosition,
        {
          font: this.config.fonts.body,
          color: this.config.colors.text,
          align: 'center',
          maxWidth: this.contentWidth * 0.9
        }
      );
    }
    
    // Add spacing after header
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}