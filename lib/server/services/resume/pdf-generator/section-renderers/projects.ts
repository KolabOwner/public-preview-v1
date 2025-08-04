import { BaseSectionRenderer } from './base-renderer';
import { formatDateRange } from '../../utils/date-formatter';

/**
 * Projects section renderer for resume PDF
 */
export class ProjectsRenderer extends BaseSectionRenderer {
  /**
   * Render the projects section
   */
  render(projects: any[]): number {
    if (!projects || projects.length === 0) return this.yPosition;
    
    this.addSectionHeading('Projects');
    
    projects.forEach((project, index) => {
      this.checkPageOverflow(50);
      
      // Project title and organization
      const title = project.title || '';
      const organization = project.organization || '';
      
      if (title || organization) {
        // Left side (title)
        if (title) {
          this.addText(title, this.config.margins.left, this.yPosition, {
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
      
      // Date and technologies
      const dateText = formatDateRange(project.startDate, project.endDate, project.current);
      const technologies = Array.isArray(project.technologies) 
        ? project.technologies.join(', ')
        : project.technologies || '';
      
      if (dateText || technologies) {
        // Date (left side)
        if (dateText) {
          this.addText(dateText, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          });
        }
        
        // Technologies (right side)
        if (technologies) {
          this.setFont(this.config.fonts.accent);
          const techWidth = this.doc.getTextWidth(technologies);
          this.addText(
            technologies,
            this.pageWidth - this.config.margins.right - techWidth,
            this.yPosition,
            {
              font: this.config.fonts.accent,
              color: this.config.colors.gray
            }
          );
        }
        
        this.yPosition += this.config.fonts.accent.size * this.config.spacing.lineHeight;
      }
      
      // Description
      if (project.description) {
        this.yPosition = this.addText(
          project.description,
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.body,
            color: this.config.colors.text,
            maxWidth: this.contentWidth
          }
        );
      }
      
      // Add spacing between projects
      if (index < projects.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}