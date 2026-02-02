/**
 * Animation Configuration
 * Defines Framer Motion variants and spring configurations for consistent animations
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

// Timing constants (in milliseconds)
export const ANIMATION_DURATIONS = {
  fast: 150,
  base: 250,
  slow: 350,
  value: 300,
  fadeIn: 400,
  max: 500, // Maximum animation duration per requirement 3.5
};

export const ANIMATION_DELAYS = {
  stagger: 0.1, // Delay between staggered animations
  none: 0,
};

// Easing functions
export const EASING = {
  easeOut: 'easeOut',
  easeIn: 'easeIn',
  easeInOut: 'easeInOut',
  linear: 'linear',
};

// Card animation variants for staggered fade-in effects
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * ANIMATION_DELAYS.stagger,
      duration: ANIMATION_DURATIONS.fadeIn / 1000, // Convert to seconds
      ease: EASING.easeOut,
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
    transition: { 
      duration: ANIMATION_DURATIONS.base / 1000, // Convert to seconds
    },
  },
};

// Page transition variants for route changes
export const pageVariants = {
  initial: { 
    opacity: 0, 
    x: -20 
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: ANIMATION_DURATIONS.slow / 1000, // Convert to seconds
      ease: EASING.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000, // Convert to seconds
      ease: EASING.easeIn,
    },
  },
};

// Spring configuration for smooth value animations
export const valueSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  duration: ANIMATION_DURATIONS.value / 1000, // Convert to seconds
};

// Toast notification animation variants
export const toastVariants = {
  initial: { 
    opacity: 0, 
    x: 100, 
    scale: 0.8 
  },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: ANIMATION_DURATIONS.base / 1000, // Convert to seconds
      ease: EASING.easeOut,
    },
  },
  exit: { 
    opacity: 0, 
    x: 100, 
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATIONS.fast / 1000, // Convert to seconds
      ease: EASING.easeIn,
    },
  },
};

// Gauge chart animation configuration
export const gaugeSpring = {
  type: 'spring',
  stiffness: 80,
  damping: 20,
  duration: ANIMATION_DURATIONS.value / 1000, // Convert to seconds
};

// Pulse animation configuration for alerts
export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: EASING.easeInOut,
    },
  },
};

// Skeleton loader shimmer animation
export const shimmerVariants = {
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: EASING.linear,
    },
  },
};
