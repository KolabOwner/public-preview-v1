import { BaseSectionRenderer } from './base-renderer';

/**
 * Coursework section renderer for resume PDF
 */
export class CourseworkRenderer extends BaseSectionRenderer {
  /**
   * Render the coursework section
   */
  render(coursework: any[]): number {
    if (!coursework || coursework.length === 0) return this.yPosition;
    
    this.addSectionHeading('Relevant Coursework');
    
    // Group coursework by department if available, otherwise show as list
    const groupedCourses = this.groupCoursesByDepartment(coursework);
    
    Object.entries(groupedCourses).forEach(([department, courses], groupIndex) => {
      this.checkPageOverflow(30);
      
      // Department heading (if not 'Other')
      if (department !== 'Other' && Object.keys(groupedCourses).length > 1) {
        this.yPosition = this.addText(
          `${department}:`,
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.subheading,
            color: this.config.colors.black
          }
        );
      }
      
      // Course list
      const courseNames = courses.map(course => course.name).filter(Boolean);
      if (courseNames.length > 0) {
        const coursesText = courseNames.join(' • ');
        this.yPosition = this.addText(
          coursesText,
          this.config.margins.left + (department !== 'Other' && Object.keys(groupedCourses).length > 1 ? 10 : 0),
          this.yPosition,
          {
            font: this.config.fonts.body,
            color: this.config.colors.text,
            maxWidth: this.contentWidth - (department !== 'Other' && Object.keys(groupedCourses).length > 1 ? 10 : 0)
          }
        );
      }
      
      // Add spacing between departments
      if (groupIndex < Object.keys(groupedCourses).length - 1) {
        this.yPosition += 4;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
  
  /**
   * Group courses by department
   */
  private groupCoursesByDepartment(coursework: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    coursework.forEach(course => {
      const department = course.department || 'Other';
      if (!grouped[department]) {
        grouped[department] = [];
      }
      grouped[department].push(course);
    });
    
    return grouped;
  }
}