/**
 * Theme Constants
 * Defines color scheme, shadows, radius, and transition values
 * Requirements: 1.1, 1.4
 */

// Color scheme constants
export const COLORS = {
  // Primary colors (cyan/blue accents)
  primary: '#06b6d4', // cyan-500
  primaryDark: '#0891b2', // cyan-600
  primaryLight: '#22d3ee', // cyan-400
  
  // Status colors
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  
  // Background colors (dark theme)
  bgPrimary: '#0f172a', // slate-900
  bgSecondary: '#1e293b', // slate-800
  bgTertiary: '#334155', // slate-700
  bgQuaternary: '#475569', // slate-600
  
  // Text colors
  textPrimary: '#f8fafc', // slate-50
  textSecondary: '#cbd5e1', // slate-300
  textTertiary: '#94a3b8', // slate-400
  textMuted: '#64748b', // slate-500
  
  // Gauge chart colors
  gaugeGreen: '#10b981', // green-500
  gaugeYellow: '#f59e0b', // amber-500
  gaugeRed: '#ef4444', // red-500
  gaugeGray: '#475569', // slate-600 (background)
};

// Shadow values
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// Border radius values
export const RADIUS = {
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  full: '9999px',
  none: '0',
};

// Transition duration constants (in milliseconds)
export const TRANSITIONS = {
  fast: 150,
  base: 250,
  slow: 350,
  slower: 500,
};

// CSS custom properties mapping
export const CSS_VARIABLES = {
  // Colors
  '--color-primary': COLORS.primary,
  '--color-primary-dark': COLORS.primaryDark,
  '--color-success': COLORS.success,
  '--color-warning': COLORS.warning,
  '--color-danger': COLORS.danger,
  '--color-info': COLORS.info,
  
  // Backgrounds
  '--bg-primary': COLORS.bgPrimary,
  '--bg-secondary': COLORS.bgSecondary,
  '--bg-tertiary': COLORS.bgTertiary,
  
  // Text
  '--text-primary': COLORS.textPrimary,
  '--text-secondary': COLORS.textSecondary,
  '--text-tertiary': COLORS.textTertiary,
  
  // Shadows
  '--shadow-sm': SHADOWS.sm,
  '--shadow-md': SHADOWS.md,
  '--shadow-lg': SHADOWS.lg,
  '--shadow-xl': SHADOWS.xl,
  
  // Radius
  '--radius-sm': RADIUS.sm,
  '--radius-md': RADIUS.md,
  '--radius-lg': RADIUS.lg,
  
  // Transitions
  '--transition-fast': `${TRANSITIONS.fast}ms`,
  '--transition-base': `${TRANSITIONS.base}ms`,
  '--transition-slow': `${TRANSITIONS.slow}ms`,
};

// Toast notification durations
export const TOAST_DURATION = {
  default: 5000, // 5 seconds
  short: 3000, // 3 seconds
  long: 7000, // 7 seconds
};

// Gauge chart thresholds
export const GAUGE_THRESHOLDS = {
  gas: {
    warning: 300,
    danger: 500,
    min: 0,
    max: 1000,
  },
  voltage: {
    warning: 3.3,
    danger: 3.0,
    min: 0,
    max: 5.0,
  },
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Touch target minimum size (for mobile accessibility)
export const TOUCH_TARGET_MIN_SIZE = 44; // pixels
