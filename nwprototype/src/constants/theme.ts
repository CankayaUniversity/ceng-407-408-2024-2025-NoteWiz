// src/constants/theme.ts

export type CategoryType = 'work' | 'personal' | 'shopping' | 'ideas' | 'todo' | 'other';

// Ana renk tiplerini tanımlayalım
interface ColorGradients {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface BackgroundColors {
  default: string;
  paper: string;
  surface: string; // Bu eksikti ve hataya sebep oluyordu
}

export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0', 
    400: '#BDBDBD',
    500: '#9E9E9E', 
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  } as ColorGradients,
  // Yeni eklenecek background özellikleri
  background: {
    default: '#FFFFFF',
    paper: '#F2F2F7',
    surface: '#FFFFFF' // Bu eksikti ve hataya sebep oluyordu
  } as BackgroundColors
};

// COLORS nesnesini ekleyelim - Bu eksikti ve hataya sebep oluyordu
export const COLORS = {
  primary: {
    main: '#007AFF',
    light: '#5AC8FA',
    dark: '#0062CC',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#5856D6',
    light: '#7B7ADA',
    dark: '#3F3DC0',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#FF3B30',
    light: '#FF6B67',
    dark: '#CC2F26',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF9500',
    light: '#FFAC33',
    dark: '#CC7700',
    contrastText: '#000000',
  },
  info: {
    main: '#5AC8FA',
    light: '#8AD4FA',
    dark: '#0091EA',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#34C759',
    light: '#4CD964',
    dark: '#28A745',
    contrastText: '#FFFFFF',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    disabled: '#9E9E9E',
  },
  background: {
    default: '#FFFFFF',
    paper: '#F2F2F7',
    surface: '#FFFFFF'
  },
  border: {
    light: '#E0E0E0',    // Açık kenarlık rengi
    main: '#BDBDBD',     // Normal kenarlık rengi
    dark: '#9E9E9E',     // Koyu kenarlık rengi
  },
  categories: {
    work: '#4C6EF5',
    personal: '#40C057',
    shopping: '#FA5252',
    ideas: '#FD7E14',
    todo: '#BE4BDB',
    other: '#ADB5BD'
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  families: {
    primary: 'System',
    monospace: 'Courier'
  }
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 5
  }
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
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
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
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 6
  }
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
  colors,
  COLORS, // COLORS nesnesini de ekleyelim
  spacing,
  typography,
  shadows,
  borderRadius: BORDER_RADIUS,
  animation: ANIMATION,
  layout: LAYOUT,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS
};