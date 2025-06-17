/**
 * Font Loader Integration
 * Wraps existing font loading functionality with enterprise features
 * Preserves Google Fonts CDN loading and Merriweather Light support
 */

import { 
  IFontLoader, 
  FontUrls, 
  FontConfiguration,
  FontStyle 
} from '../interfaces';
import { ComponentLogger } from '../../monitoring/logging';
import { ComponentMetricsCollector } from '../../monitoring/metrics';
import { CircuitBreaker } from '../../resilience/circuit-breaker';

/**
 * Font configurations matching existing system
 */
const FONT_CONFIGS: Record<FontStyle, FontConfiguration> = {
  elegant: {
    name: 'Merriweather',
    family: 'merriweather',
    weights: {
      300: { normal: 'Light', italic: 'Light Italic' },
      400: { normal: 'Regular', italic: 'Italic' },
      700: { normal: 'Bold', italic: 'Bold Italic' },
      900: { normal: 'Black', italic: 'Black Italic' }
    }
  },
  modern: {
    name: 'Merriweather Sans',
    family: 'merriweatherSans',
    weights: {
      300: { normal: 'Light', italic: 'Light Italic' },
      400: { normal: 'Regular', italic: 'Italic' },
      700: { normal: 'Bold', italic: 'Bold Italic' },
      800: { normal: 'ExtraBold' }
    }
  },
  classic: {
    name: 'Open Sans',
    family: 'openSans',
    weights: {
      300: { normal: 'Light', italic: 'Light Italic' },
      400: { normal: 'Regular', italic: 'Italic' },
      600: { normal: 'SemiBold', italic: 'SemiBold Italic' },
      700: { normal: 'Bold', italic: 'Bold Italic' }
    }
  },
  professional: {
    name: 'Roboto',
    family: 'roboto',
    weights: {
      300: { normal: 'Light', italic: 'Light Italic' },
      400: { normal: 'Regular', italic: 'Italic' },
      500: { normal: 'Medium', italic: 'Medium Italic' },
      700: { normal: 'Bold', italic: 'Bold Italic' }
    }
  }
};

/**
 * Font Loader that integrates with existing font loading
 * Adds caching, metrics, and resilience while preserving core behavior
 */
export class FontLoaderIntegration implements IFontLoader {
  private logger = new ComponentLogger('FontLoader');
  private metrics = new ComponentMetricsCollector('font_loading');
  private fontCache = new Map<string, ArrayBuffer>();
  private circuitBreaker: CircuitBreaker;
  
  constructor(
    private existingLoadFont: (fontUrl: string) => Promise<ArrayBuffer>,
    private existingGetFontUrls: (family: string) => FontUrls,
    private existingAddCustomFonts?: (doc: any) => Promise<void>
  ) {
    // Configure circuit breaker for font loading
    this.circuitBreaker = new CircuitBreaker('font_loading', {
      failureThreshold: 3,
      timeout: 30000, // 30 seconds for font loading
      resetTimeout: 60000
    });
  }

  /**
   * Load font from Google Fonts CDN
   */
  async loadFont(fontFamily: string, weight: string): Promise<ArrayBuffer> {
    const startTime = Date.now();
    const cacheKey = `${fontFamily}_${weight}`;
    
    try {
      // Check cache first
      if (this.fontCache.has(cacheKey)) {
        await this.logger.debug('Font loaded from cache', { fontFamily, weight });
        await this.metrics.recordMetric('font_cache_hit', 1);
        return this.fontCache.get(cacheKey)!;
      }
      
      await this.logger.info('Loading font from CDN', { fontFamily, weight });
      await this.metrics.recordMetric('font_cache_miss', 1);
      
      // Get font URL
      const fontUrls = this.getFontUrls(fontFamily as any);
      const fontUrl = this.getFontUrlForWeight(fontUrls, weight);
      
      if (!fontUrl) {
        throw new Error(`Font URL not found for ${fontFamily} ${weight}`);
      }
      
      // Load font with circuit breaker protection
      const fontData = await this.circuitBreaker.execute(async () => {
        return await this.existingLoadFont(fontUrl);
      });
      
      // Cache the result
      this.fontCache.set(cacheKey, fontData);
      
      // Record metrics
      const loadTime = Date.now() - startTime;
      await this.metrics.recordMetric('font_load_duration', loadTime);
      await this.metrics.recordMetric('font_load_success', 1);
      await this.metrics.recordMetric('font_size', fontData.byteLength);
      
      await this.logger.info('Font loaded successfully', {
        fontFamily,
        weight,
        size: fontData.byteLength,
        loadTime
      });
      
      return fontData;
      
    } catch (error) {
      const loadTime = Date.now() - startTime;
      await this.metrics.recordMetric('font_load_duration', loadTime);
      await this.metrics.recordMetric('font_load_error', 1);
      
      await this.logger.error('Font loading failed', {
        fontFamily,
        weight,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
  
  /**
   * Get font URLs for a specific font family
   */
  getFontUrls(fontFamily: 'merriweather' | 'merriweatherSans' | 'openSans'): FontUrls {
    return this.existingGetFontUrls(fontFamily);
  }
  
  /**
   * Get font configuration for a style preset
   */
  getFontConfig(style: FontStyle): FontConfiguration {
    return FONT_CONFIGS[style];
  }
  
  /**
   * Add custom fonts to jsPDF instance
   */
  async addCustomFonts(doc: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('Adding custom fonts to PDF document');
      
      if (this.existingAddCustomFonts) {
        await this.existingAddCustomFonts(doc);
      } else {
        // Default implementation - load common fonts
        const fontsToLoad = [
          { family: 'merriweather', weight: '300' }, // Merriweather Light
          { family: 'merriweather', weight: '400' },
          { family: 'merriweather', weight: '700' }
        ];
        
        for (const font of fontsToLoad) {
          try {
            const fontData = await this.loadFont(font.family, font.weight);
            // Add font to jsPDF (implementation depends on jsPDF version)
            if (doc.addFileToVFS && doc.addFont) {
              const fontName = `${font.family}-${font.weight}.ttf`;
              doc.addFileToVFS(fontName, fontData);
              doc.addFont(fontName, font.family, font.weight);
            }
          } catch (error) {
            await this.logger.warn('Failed to load font', {
              family: font.family,
              weight: font.weight,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
      
      const loadTime = Date.now() - startTime;
      await this.metrics.recordMetric('custom_fonts_load_duration', loadTime);
      
      await this.logger.info('Custom fonts added successfully', { loadTime });
      
    } catch (error) {
      await this.logger.error('Failed to add custom fonts', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw - allow PDF generation to continue with fallback fonts
    }
  }
  
  /**
   * Check if font is cached
   */
  isFontCached(fontUrl: string): boolean {
    // Extract font family and weight from URL
    const urlParts = fontUrl.split('/');
    const fontInfo = urlParts[urlParts.length - 1].split('.')[0];
    return this.fontCache.has(fontInfo);
  }
  
  /**
   * Get font URL for specific weight
   */
  private getFontUrlForWeight(fontUrls: FontUrls, weight: string): string | null {
    const weightMap: Record<string, keyof FontUrls> = {
      '300': 'light',
      'light': 'light',
      '300i': 'lightItalic',
      'lightItalic': 'lightItalic',
      '400': 'regular',
      'regular': 'regular',
      '400i': 'italic',
      'italic': 'italic',
      '700': 'bold',
      'bold': 'bold',
      '700i': 'boldItalic',
      'boldItalic': 'boldItalic',
      '900': 'black',
      'black': 'black',
      '900i': 'blackItalic',
      'blackItalic': 'blackItalic',
      '800': 'extrabold',
      'extrabold': 'extrabold'
    };
    
    const key = weightMap[weight.toLowerCase()];
    return key ? fontUrls[key] || null : null;
  }
}

/**
 * Factory function to create font loader with existing functionality
 */
export function createFontLoader(
  existingLoadFont: (fontUrl: string) => Promise<ArrayBuffer>,
  existingGetFontUrls: (family: string) => FontUrls,
  existingAddCustomFonts?: (doc: any) => Promise<void>
): IFontLoader {
  return new FontLoaderIntegration(
    existingLoadFont,
    existingGetFontUrls,
    existingAddCustomFonts
  );
}