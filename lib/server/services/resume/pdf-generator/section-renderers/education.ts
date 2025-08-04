import { BaseSectionRenderer } from './base-renderer';
import { formatDateRange } from '../../utils/date-formatter';

/**
 * Education section renderer for resume PDF
 */
export class EducationRenderer extends BaseSectionRenderer {
  /**
   * Render the education section
   */
  render(education: any[]): number {
    if (!education || education.length === 0) return this.yPosition;
    
    this.addSectionHeading('Education');
    
    education.forEach((edu, index) => {
      this.checkPageOverflow(50);
      
      // School and degree on same line
      const school = edu.school || edu.institution || '';
      const degree = edu.degree || edu.qualification || '';
      
      if (school || degree) {
        // Left side (school)
        if (school) {
          this.addText(school, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.subheading,
            color: this.config.colors.black
          });
        }
        
        // Right side (degree)
        if (degree) {
          this.setFont(this.config.fonts.subheading);
          const degreeWidth = this.doc.getTextWidth(degree);
          this.addText(
            degree,
            this.pageWidth - this.config.margins.right - degreeWidth,
            this.yPosition,
            {
              font: this.config.fonts.subheading,
              color: this.config.colors.black
            }
          );
        }
        
        this.yPosition += this.config.fonts.subheading.size * this.config.spacing.lineHeight;
      }
      
      // Field of study, date, and location line
      const dateText = edu.formattedDate || 
        formatDateRange(edu.startDate, edu.endDate || edu.graduationDate, edu.current);
      
      const leftItems = [];
      if (edu.fieldOfStudy) leftItems.push(edu.fieldOfStudy);
      if (dateText) leftItems.push(dateText);
      
      const hasSecondLine = leftItems.length > 0 || edu.location;
      
      if (hasSecondLine) {
        // Left side (field of study and date)
        if (leftItems.length > 0) {
          this.addText(leftItems.join(' • '), this.config.margins.left, this.yPosition, {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          });
        }
        
        // Right side (location)
        if (edu.location) {
          this.setFont(this.config.fonts.accent);
          const locationWidth = this.doc.getTextWidth(edu.location);
          this.addText(
            edu.location,
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
      
      // GPA if present
      if (edu.gpa || edu.score) {
        const gpaText = edu.gpa ? `GPA: ${edu.gpa}` : edu.score;
        this.yPosition = this.addText(
          gpaText,
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.body,
            color: this.config.colors.text
          }
        );
      }
      
      // Description if present
      if (edu.description) {
        this.yPosition = this.addText(
          edu.description,
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.body,
            color: this.config.colors.text,
            maxWidth: this.contentWidth
          }
        );
      }
      
      // Add spacing between education entries
      if (index < education.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}