import { cleanExtractedText } from '../utils/text-formatter';

/**
 * PDF text extraction utilities
 */
export class PDFExtractor {
  private static pdfJsLoaded = false;

  /**
   * Initialize PDF.js library
   */
  private static async initializePdfJs(): Promise<void> {
    if (this.pdfJsLoaded) return;
    
    try {
      // Dynamically import PDF.js if not already loaded
      if (typeof window !== 'undefined' && !('pdfjsLib' in window)) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PDF.js'));
          document.head.appendChild(script);
        });
        
        // Load worker
        const workerScript = document.createElement('script');
        workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        await new Promise<void>((resolve, reject) => {
          workerScript.onload = () => resolve();
          workerScript.onerror = () => reject(new Error('Failed to load PDF.js worker'));
          document.head.appendChild(workerScript);
        });
      }
      
      // Configure worker
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      this.pdfJsLoaded = true;
      console.log('PDF.js initialized successfully');
    } catch (error) {
      console.error('Error initializing PDF.js:', error);
      throw error;
    }
  }

  /**
   * Extract text from a PDF file using PDF.js
   */
  public static async extractTextFromPDF(file: File): Promise<string> {
    console.log('Extracting text from PDF using client-side PDF.js');
    return this.extractTextWithPdfJs(file);
  }

  /**
   * Extract text from a PDF file using PDF.js
   * This is a client-side extraction method
   */
  private static async extractTextWithPdfJs(file: File): Promise<string> {
    console.log('Using PDF.js for text extraction');
    
    try {
      // Initialize PDF.js if needed
      await this.initializePdfJs();
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
      });
      
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Process text items
        const pageText = textContent.items
          .map((item: any) => {
            // Handle both regular text items and marked content
            if (item.str) {
              return item.str;
            }
            return '';
          })
          .join(' ');
        
        fullText += pageText + '\n\n';
      }
      
      // Clean up the text
      fullText = cleanExtractedText(fullText);
      
      return fullText;
    } catch (error) {
      console.error('PDF.js extraction error:', error);
      throw new Error(`Failed to extract text with PDF.js: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate PDF file
   */
  public static validatePDFFile(file: File): void {
    // Check file type
    if (!file.type || !file.type.includes('pdf')) {
      throw new Error('File must be a PDF');
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
    
    // Check file name
    if (!file.name || file.name.length === 0) {
      throw new Error('File must have a valid name');
    }
  }
}