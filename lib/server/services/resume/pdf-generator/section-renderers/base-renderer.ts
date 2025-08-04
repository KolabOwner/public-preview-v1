import { jsPDF } from 'jspdf';
import type { PDFConfiguration, FontDefinition } from '../pdf-config';
import { FontManager } from '../font-manager';

/**
 * Base class for all section renderers
 */
export abstract class BaseSectionRenderer {
  protected doc: jsPDF;
  protected config: PDFConfiguration;
  protected pageWidth: number;
  protected pageHeight: number;
  protected contentWidth: number;
  protected yPosition: number;
  protected customFontsLoaded: boolean;

  constructor(
    doc: jsPDF,
    config: PDFConfiguration,
    yPosition: number,
    customFontsLoaded: boolean = false
  ) {
    this.doc = doc;
    this.config = config;
    this.yPosition = yPosition;
    this.customFontsLoaded = customFontsLoaded;
    
    // Set page dimensions
    this.pageWidth = doc.internal.pageSize.width;
    this.pageHeight = doc.internal.pageSize.height;
    this.contentWidth = this.pageWidth - config.margins.left - config.margins.right;
  }

  /**
   * Abstract method to render the section
   */
  abstract render(data: any): number;

  /**
   * Set font based on font definition
   */
  protected setFont(fontDef: FontDefinition): void {
    const fontName = this.customFontsLoaded
      ? FontManager.getFontName(fontDef.family, fontDef.weight, fontDef.style)
      : FontManager.getStandardFontVariant(
          FontManager.getStandardFontFallback(fontDef.family),
          fontDef.weight,
          fontDef.style
        );
    
    try {
      this.doc.setFont(fontName);
    } catch (error) {
      console.warn(`Font ${fontName} not available, using fallback`);
      this.doc.setFont('helvetica');
    }
    
    this.doc.setFontSize(fontDef.size);
  }

  /**
   * Add text with font and color options
   */
  protected addText(
    text: string,
    x: number,
    y: number,
    options: {
      font: FontDefinition;
      color?: { r: number; g: number; b: number };
      maxWidth?: number;
      align?: 'left' | 'center' | 'right';
    }
  ): number {
    this.setFont(options.font);
    const color = options.color || this.config.colors.text;
    this.doc.setTextColor(color.r, color.g, color.b);
    
    if (options.maxWidth) {
      const lines = this.splitTextToLines(text, options.maxWidth);
      const lineHeight = options.font.size * this.config.spacing.lineHeight;
      
      lines.forEach((line, index) => {
        const alignOptions: any = {};
        if (options.align) alignOptions.align = options.align;
        this.doc.text(line, x, y + (index * lineHeight), alignOptions);
      });
      
      return y + (lines.length * lineHeight);
    } else {
      const alignOptions: any = {};
      if (options.align) alignOptions.align = options.align;
      this.doc.text(text, x, y, alignOptions);
      return y + options.font.size * this.config.spacing.lineHeight;
    }
  }

  /**
   * Split text into lines based on maximum width
   */
  protected splitTextToLines(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const words = text.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = this.doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Check if we need to add a new page
   */
  protected checkPageOverflow(requiredSpace = 60): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.config.margins.bottom) {
      this.doc.addPage();
      this.yPosition = this.config.margins.top;
    }
  }

  /**
   * Add a section heading
   */
  protected addSectionHeading(heading: string): void {
    this.checkPageOverflow(40);
    
    // Add section heading
    this.yPosition = this.addText(
      heading.toUpperCase(),
      this.config.margins.left,
      this.yPosition,
      {
        font: this.config.fonts.heading,
        color: this.config.colors.black
      }
    );
    
    // Add separator line
    this.doc.setDrawColor(this.config.colors.gray.r, this.config.colors.gray.g, this.config.colors.gray.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.config.margins.left,
      this.yPosition - 2,
      this.pageWidth - this.config.margins.right,
      this.yPosition - 2
    );
    
    this.yPosition += 8;
  }

  /**
   * Get the current Y position
   */
  public getYPosition(): number {
    return this.yPosition;
  }
}