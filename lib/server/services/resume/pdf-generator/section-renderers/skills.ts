import { BaseSectionRenderer } from './base-renderer';

/**
 * Skills section renderer for resume PDF
 */
export class SkillsRenderer extends BaseSectionRenderer {
  /**
   * Render the skills section
   */
  render(skillCategories: any[]): number {
    if (!skillCategories || skillCategories.length === 0) return this.yPosition;
    
    this.addSectionHeading('Skills');
    
    skillCategories.forEach((category, index) => {
      this.checkPageOverflow(30);
      
      const skills = this.extractSkills(category.skills);
      
      if (skills.length > 0) {
        // Category name
        if (category.name) {
          this.yPosition = this.addText(
            `${category.name}:`,
            this.config.margins.left,
            this.yPosition,
            {
              font: this.config.fonts.body,
              color: this.config.colors.black
            }
          );
        }
        
        // Skills list
        const skillsText = skills.join(' • ');
        this.yPosition = this.addText(
          skillsText,
          this.config.margins.left + (category.name ? 10 : 0),
          this.yPosition,
          {
            font: this.config.fonts.body,
            color: this.config.colors.text,
            maxWidth: this.contentWidth - (category.name ? 10 : 0)
          }
        );
        
        // Add spacing between categories
        if (index < skillCategories.length - 1) {
          this.yPosition += 4;
        }
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
  
  /**
   * Extract skills from various formats
   */
  private extractSkills(skills: any): string[] {
    if (!skills) return [];
    
    // If it's already an array of strings
    if (Array.isArray(skills)) {
      return skills.map(skill => {
        if (typeof skill === 'string') return skill;
        if (skill && typeof skill === 'object' && skill.name) return skill.name;
        return '';
      }).filter(Boolean);
    }
    
    // If it's a string, split by common delimiters
    if (typeof skills === 'string') {
      return skills.split(/[,;•·▪|]/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    
    return [];
  }
}