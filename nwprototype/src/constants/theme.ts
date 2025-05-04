// src/constants/theme.ts

export type CategoryType = 'work' | 'personal' | 'shopping' | 'ideas' | 'todo' | 'other';

export const COLORS = {
  // Main colors
  primary: {
    light: '#6B8AF2',
    main: '#4361DE',
    dark: '#2D47B2',
    100: '#EDF2FF',
    200: '#DBE4FF',
    300: '#BAC8FF',
    400: '#91A7FF',
    500: '#748FFC',
    600: '#4C6EF5',
    700: '#4263EB',
    800: '#364FC7',
    900: '#2B3B99'
  },

  secondary: {
    light: '#96F2D7',
    main: '#12B886',
    dark: '#087F5B',
    100: '#E6FCF5',
    200: '#C3FAE8',
    300: '#96F2D7',
    400: '#63E6BE',
    500: '#38D9A9',
    600: '#12B886',
    700: '#0CA678',
    800: '#087F5B',
    900: '#054D3C'
  },

  // Status colors (success, warning, error, info etc.)
  success: {
    light: '#69DB7C',
    main: '#40C057',
    dark: '#2B8A3E',
    contrastText: '#FFFFFF'
  },
  warning: {
    light: '#FFD43B',
    main: '#FAB005',
    dark: '#F08C00',
    contrastText: '#212529'
  },
  error: {
    light: '#FF8787',
    main: '#FA5252',
    dark: '#E03131',
    contrastText: '#FFFFFF'
  },
  info: {
    light: '#74C0FC',
    main: '#339AF0',
    dark: '#1C7ED6',
    contrastText: '#FFFFFF'
  },

  // Neutral colors
  neutral: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },

  // Text colors
  text: {
    primary: '#212529',
    secondary: '#495057',
    tertiary: '#666666',
    inverted: '#FFFFFF',
    disabled: '#ADB5BD',
    hint: '#868E96',
  },

  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
    surface: '#FFFFFF',
  },

  // Border colors - added to fix FolderNavigation error
  border: {
    light: '#DEE2E6',
    main: '#CED4DA'
  },

  // Category colors
  categories: {
    work: '#4C6EF5',
    personal: '#82C91E',
    shopping: '#FD7E14',
    ideas: '#BE4BDB',
    todo: '#FA5252',
    other: '#868E96'
  } as Record<CategoryType, string>
};

// Spacing and distances
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  screenPadding: 16,
  cardPadding: 16,
  sectionSpacing: 24
} as const;

// Typography
export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display1: 32,
    display2: 40,
    display3: 48
  } as const,

  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  } as const
};

// Shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8
  }
} as const;

// Border radius
export const BORDER_RADIUS = {
 none: 0,
 xs: 4,
 sm: 8,
 md: 12,
 lg: 16,
 xl: 24,
 xxl: 32,
 full: 9999
} as const;

// Animation durations
export const ANIMATION = {
 durations: {
   shortest: 150,
   shorter: 200,
   short: 250,
   standard: 300,
   complex: 375,
   enteringScreen: 225,
   leavingScreen: 195
 } as const,
 
 easings: {
   easeInOut: 'ease-in-out',
   easeOut: 'ease-out',
   easeIn: 'ease-in',
   sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
 } as const
};

// Layout constants
export const LAYOUT = {
 maxWidth: 420,
 headerHeight: 56,
 bottomNavHeight: 60,
 tabBarHeight: 48
} as const;

// z-index values
export const Z_INDEX = {
 drawer: 1200,
 modal: 1300,
 snackbar: 1400,
 tooltip: 1500
} as const;

// Media query breakpoints
export const BREAKPOINTS = {
 xs: 0,
 sm: 600,
 md: 960,
 lg: 1280,
 xl: 1920
} as const;

export default {
 COLORS,
 SPACING,
 TYPOGRAPHY,
 SHADOWS,
 BORDER_RADIUS,
 ANIMATION,
 LAYOUT,
 Z_INDEX,
 BREAKPOINTS
};