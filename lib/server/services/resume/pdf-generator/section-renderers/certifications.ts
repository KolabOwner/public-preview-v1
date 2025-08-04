import { BaseSectionRenderer } from './base-renderer';

/**
 * Certifications section renderer for resume PDF
 */
export class CertificationsRenderer extends BaseSectionRenderer {
  /**
   * Render the certifications section
   */
  render(certifications: any[]): number {
    if (!certifications || certifications.length === 0) return this.yPosition;
    
    this.addSectionHeading('Certifications');
    
    certifications.forEach((cert, index) => {
      this.checkPageOverflow(40);
      
      // Certification name and issuer
      const name = cert.name || cert.title || '';
      const issuer = cert.issuer || cert.organization || '';
      
      if (name || issuer) {
        // Left side (name)
        if (name) {
          this.addText(name, this.config.margins.left, this.yPosition, {
            font: this.config.fonts.subheading,
            color: this.config.colors.black
          });
        }
        
        // Right side (issuer)
        if (issuer) {
          this.setFont(this.config.fonts.subheading);
          const issuerWidth = this.doc.getTextWidth(issuer);
          this.addText(
            issuer,
            this.pageWidth - this.config.margins.right - issuerWidth,
            this.yPosition,
            {
              font: this.config.fonts.subheading,
              color: this.config.colors.black
            }
          );
        }
        
        this.yPosition += this.config.fonts.subheading.size * this.config.spacing.lineHeight;
      }
      
      // Date and credential ID
      const date = cert.date || cert.issueDate || '';
      const credentialId = cert.credentialId || '';
      
      if (date || credentialId) {
        const leftItems = [];
        if (date) leftItems.push(date);
        if (credentialId) leftItems.push(`ID: ${credentialId}`);
        
        this.yPosition = this.addText(
          leftItems.join(' • '),
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.accent,
            color: this.config.colors.gray
          }
        );
      }
      
      // URL if present
      if (cert.url) {
        this.yPosition = this.addText(
          cert.url,
          this.config.margins.left,
          this.yPosition,
          {
            font: this.config.fonts.small,
            color: this.config.colors.gray
          }
        );
      }
      
      // Add spacing between certifications
      if (index < certifications.length - 1) {
        this.yPosition += this.config.spacing.itemGap;
      }
    });
    
    this.yPosition += this.config.spacing.sectionGap;
    
    return this.yPosition;
  }
}