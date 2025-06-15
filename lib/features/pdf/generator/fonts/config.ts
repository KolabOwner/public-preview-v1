// lib/pdf-custom-fonts.ts

import { jsPDF } from 'jspdf';

// Font URLs from Google Fonts CDN
export const FONT_URLS = {
  merriweather: {
    light: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.ttf',
    lightItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7lXcf_hP3a.ttf',
    regular: 'https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l52xwNZWMf6.ttf',
    italic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eSZJdeP3.ttf',
    bold: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.ttf',
    boldItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR71Wsf_hP3a.ttf',
    black: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZXMf6.ttf',
    blackItalic: 'https://fonts.gstatic.com/s/merriweather/v30/u-4l0qyriQwlOrhSvowK_l5-eR7NWMf_hP3a.ttf'
  },
  merriweatherSans: {
    light: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_5asQTb6hZ2JKZ.ttf',
    regular: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.ttf',
    bold: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_NbMQTb6hZ2JKZ.ttf',
    extrabold: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF-RaMQTb6hZ2JKZ.ttf'
  },
  // Fallback fonts
  openSans: {
    regular: 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4n.ttf',
    bold: 'https://fonts.gstatic.com/s/opensans/v35/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsg-1y4n.ttf'
  }
};

// Font family definitions
export const FONT_FAMILIES = {
  merriweather: {
    name: 'Merriweather',
    weights: {
      300: { normal: 'merriweather-light', italic: 'merriweather-lightitalic' },
      400: { normal: 'merriweather-regular', italic: 'merriweather-italic' },
      700: { normal: 'merriweather-bold', italic: 'merriweather-bolditalic' },
      900: { normal: 'merriweather-black', italic: 'merriweather-blackitalic' }
    }
  },
  merriweatherSans: {
    name: 'Merriweather Sans',
    weights: {
      300: { normal: 'merriweathersans-light' },
      400: { normal: 'merriweathersans-regular' },
      700: { normal: 'merriweathersans-bold' },
      800: { normal: 'merriweathersans-extrabold' }
    }
  },
  helvetica: {
    name: 'Helvetica',
    weights: {
      400: { normal: 'helvetica', italic: 'helvetica-oblique' },
      700: { normal: 'helvetica-bold', italic: 'helvetica-boldoblique' }
    }
  },
  times: {
    name: 'Times',
    weights: {
      400: { normal: 'times', italic: 'times-italic' },
      700: { normal: 'times-bold', italic: 'times-bolditalic' }
    }
  }
};

// Font loading cache
const fontCache = new Map<string, ArrayBuffer>();

/**
 * Load font from URL and cache it
 */
async function loadFontFromUrl(url: string): Promise<ArrayBuffer> {
  if (fontCache.has(url)) {
    return fontCache.get(url)!;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load font from ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    fontCache.set(url, arrayBuffer);
    return arrayBuffer;
  } catch (error) {
    console.error(`Error loading font from ${url}:`, error);
    throw error;
  }
}

/**
 * Convert ArrayBuffer to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

/**
 * Add custom fonts to jsPDF instance
 */
export async function addCustomFonts(doc: jsPDF, fontFamily: 'merriweather' | 'merriweatherSans' | 'openSans' = 'merriweather') {
  try {
    if (fontFamily === 'merriweather') {
      // Load Merriweather Light
      const lightFont = await loadFontFromUrl(FONT_URLS.merriweather.light);
      doc.addFileToVFS('Merriweather-Light.ttf', arrayBufferToBase64(lightFont));
      doc.addFont('Merriweather-Light.ttf', 'merriweather-light', 'normal', 300);
      
      // Load Merriweather Light Italic
      const lightItalicFont = await loadFontFromUrl(FONT_URLS.merriweather.lightItalic);
      doc.addFileToVFS('Merriweather-LightItalic.ttf', arrayBufferToBase64(lightItalicFont));
      doc.addFont('Merriweather-LightItalic.ttf', 'merriweather-lightitalic', 'italic', 300);
      
      // Load Merriweather Regular
      const regularFont = await loadFontFromUrl(FONT_URLS.merriweather.regular);
      doc.addFileToVFS('Merriweather-Regular.ttf', arrayBufferToBase64(regularFont));
      doc.addFont('Merriweather-Regular.ttf', 'merriweather-regular', 'normal', 400);
      
      // Load Merriweather Italic
      const italicFont = await loadFontFromUrl(FONT_URLS.merriweather.italic);
      doc.addFileToVFS('Merriweather-Italic.ttf', arrayBufferToBase64(italicFont));
      doc.addFont('Merriweather-Italic.ttf', 'merriweather-italic', 'italic', 400);
      
      // Load Merriweather Bold
      const boldFont = await loadFontFromUrl(FONT_URLS.merriweather.bold);
      doc.addFileToVFS('Merriweather-Bold.ttf', arrayBufferToBase64(boldFont));
      doc.addFont('Merriweather-Bold.ttf', 'merriweather-bold', 'normal', 700);
      
      // Load Merriweather Bold Italic
      const boldItalicFont = await loadFontFromUrl(FONT_URLS.merriweather.boldItalic);
      doc.addFileToVFS('Merriweather-BoldItalic.ttf', arrayBufferToBase64(boldItalicFont));
      doc.addFont('Merriweather-BoldItalic.ttf', 'merriweather-bolditalic', 'italic', 700);
      
      console.log('Merriweather fonts loaded successfully');
      return true;
    } else if (fontFamily === 'merriweatherSans') {
      // Load Merriweather Sans variants
      const lightFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.light);
      doc.addFileToVFS('MerriweatherSans-Light.ttf', arrayBufferToBase64(lightFont));
      doc.addFont('MerriweatherSans-Light.ttf', 'merriweathersans-light', 'normal', 300);
      
      const regularFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.regular);
      doc.addFileToVFS('MerriweatherSans-Regular.ttf', arrayBufferToBase64(regularFont));
      doc.addFont('MerriweatherSans-Regular.ttf', 'merriweathersans-regular', 'normal', 400);
      
      const boldFont = await loadFontFromUrl(FONT_URLS.merriweatherSans.bold);
      doc.addFileToVFS('MerriweatherSans-Bold.ttf', arrayBufferToBase64(boldFont));
      doc.addFont('MerriweatherSans-Bold.ttf', 'merriweathersans-bold', 'normal', 700);
      
      console.log('Merriweather Sans fonts loaded successfully');
      return true;
    }
  } catch (error) {
    console.error('Error loading custom fonts:', error);
    return false;
  }
}

/**
 * Get font name for jsPDF based on family, weight and style
 */
export function getFontName(family: string, weight: number = 400, style: 'normal' | 'italic' = 'normal'): string {
  const fontFamily = FONT_FAMILIES[family as keyof typeof FONT_FAMILIES];
  
  if (!fontFamily) {
    return 'helvetica'; // Fallback
  }
  
  const weightDef = fontFamily.weights[weight as keyof typeof fontFamily.weights];
  if (!weightDef) {
    // Find closest weight
    const weights = Object.keys(fontFamily.weights).map(Number).sort((a, b) => a - b);
    const closest = weights.reduce((prev, curr) => 
      Math.abs(curr - weight) < Math.abs(prev - weight) ? curr : prev
    );
    const closestWeightDef = fontFamily.weights[closest as keyof typeof fontFamily.weights];
    return closestWeightDef[style] || closestWeightDef.normal || 'helvetica';
  }
  
  return weightDef[style] || weightDef.normal || 'helvetica';
}

/**
 * Font presets for different resume styles
 */
export const FONT_PRESETS = {
  elegant: {
    heading: { family: 'merriweather', weight: 700, size: 18 },
    subheading: { family: 'merriweather', weight: 400, size: 12 },
    body: { family: 'merriweather', weight: 300, size: 10 },
    accent: { family: 'merriweatherSans', weight: 400, size: 9 }
  },
  modern: {
    heading: { family: 'merriweatherSans', weight: 700, size: 18 },
    subheading: { family: 'merriweatherSans', weight: 700, size: 11 },
    body: { family: 'merriweatherSans', weight: 400, size: 10 },
    accent: { family: 'merriweatherSans', weight: 300, size: 9 }
  },
  classic: {
    heading: { family: 'merriweather', weight: 400, size: 16 },
    subheading: { family: 'merriweather', weight: 700, size: 11 },
    body: { family: 'merriweather', weight: 400, size: 10 },
    accent: { family: 'merriweather', weight: 300, size: 9 }
  },
  professional: {
    heading: { family: 'helvetica', weight: 700, size: 16 },
    subheading: { family: 'helvetica', weight: 700, size: 11 },
    body: { family: 'helvetica', weight: 400, size: 10 },
    accent: { family: 'helvetica', weight: 400, size: 9 }
  }
};