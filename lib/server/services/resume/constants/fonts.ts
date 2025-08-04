/**
 * Font URL definitions for custom fonts used in PDF generation
 */
export const FONT_URLS = {
  merriweather: {
    light: 'https://fonts.gstatic.com/s/merriweather/v35/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2',
    lightItalic: 'https://fonts.gstatic.com/s/merriweather/v35/u-4l0qyriQwlOrhSvowK_l5-eR7lXcf_hP3hJGI.woff2',
    regular: 'https://fonts.gstatic.com/s/merriweather/v35/u-440qyriQwlOrhSvowK_l52xwNZWMf6.woff2',
    italic: 'https://fonts.gstatic.com/s/merriweather/v35/u-4m0qyriQwlOrhSvowK_l5-eSZJdeP3rHnMI.woff2',
    bold: 'https://fonts.gstatic.com/s/merriweather/v35/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.woff2',
    boldItalic: 'https://fonts.gstatic.com/s/merriweather/v35/u-4l0qyriQwlOrhSvowK_l5-eR71Wsf_hP3hJGI.woff2'
  },
  merriweatherSans: {
    light: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_5asQTb6hZ2JKZ.woff2',
    regular: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-c99IRs1JiJN1FRAMjTN5zd9vgsFHX1QjU.woff2',
    bold: 'https://fonts.gstatic.com/s/merriweathersans/v26/2-cO9IRs1JiJN1FRAMjTN5zd9vgsFF_NbMQTb6hZ2JKZ.woff2'
  }
};

/**
 * Font family definitions with weight mappings
 */
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

/**
 * Font configurations for different resume styles
 */
export const FONT_CONFIGURATIONS: Record<string, any> = {
  professional: {
    fonts: {
      name: { family: 'merriweather', size: 12.825, weight: 700 },
      heading: { family: 'merriweather', size: 8.9395, weight: 700 },
      subheading: { family: 'merriweather', size: 7.771, weight: 700 },
      body: { family: 'merriweather', size: 6.6025, weight: 400 },
      accent: { family: 'merriweather', size: 6.6025, weight: 400 },
      small: { family: 'merriweather', size: 5.7855, weight: 400 }
    }
  },
  elegant: {
    fonts: {
      name: { family: 'times', size: 14, weight: 700 },
      heading: { family: 'times', size: 9.8, weight: 700 },
      subheading: { family: 'times', size: 8.61, weight: 700 },
      body: { family: 'times', size: 7.42, weight: 400 },
      accent: { family: 'times', size: 7.42, weight: 400, style: 'italic' },
      small: { family: 'times', size: 6.51, weight: 400 }
    }
  },
  modern: {
    fonts: {
      name: { family: 'helvetica', size: 13, weight: 700 },
      heading: { family: 'helvetica', size: 9.1, weight: 700 },
      subheading: { family: 'helvetica', size: 8.008, weight: 700 },
      body: { family: 'helvetica', size: 6.916, weight: 400 },
      accent: { family: 'helvetica', size: 6.916, weight: 700 },
      small: { family: 'helvetica', size: 6.096, weight: 400 }
    }
  },
  classic: {
    fonts: {
      name: { family: 'times', size: 12.75, weight: 700 },
      heading: { family: 'times', size: 8.925, weight: 700 },
      subheading: { family: 'times', size: 7.8465, weight: 700 },
      body: { family: 'times', size: 6.768, weight: 400 },
      accent: { family: 'times', size: 6.768, weight: 400 },
      small: { family: 'times', size: 5.9475, weight: 400 }
    }
  }
};

/**
 * Default PDF configuration
 */
export const DEFAULT_CONFIG: any = {
  colors: {
    text: { r: 51, g: 51, b: 51 },
    black: { r: 0, g: 0, b: 0 },
    gray: { r: 102, g: 102, b: 102 },
    accent: { r: 51, g: 51, b: 51 }
  },
  margins: {
    top: 54,
    right: 54,
    bottom: 54,
    left: 54
  },
  fonts: {
    name: { family: 'merriweather', size: 12.825, weight: 700 },
    heading: { family: 'merriweather', size: 8.9395, weight: 700 },
    subheading: { family: 'merriweather', size: 7.771, weight: 700 },
    body: { family: 'merriweather', size: 6.6025, weight: 400 },
    accent: { family: 'merriweather', size: 6.6025, weight: 400 },
    small: { family: 'merriweather', size: 5.7855, weight: 400 }
  },
  spacing: {
    sectionGap: 17,
    itemGap: 6,
    lineHeight: 1.3
  }
};