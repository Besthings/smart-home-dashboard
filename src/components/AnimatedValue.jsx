import { useSpring, useTransform, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * AnimatedValue - Smoothly animates numeric value changes
 * @param {number} value - The numeric value to display
 * @param {number} decimals - Number of decimal places (default: 0)
 * @param {number} duration - Animation duration in seconds (default: 0.3)
 * @param {string} className - Additional CSS classes
 */
export default function AnimatedValue({ 
  value, 
  decimals = 0, 
  duration = 0.3,
  className = '' 
}) {
  const prefersReducedMotion = useReducedMotion();
  
  // Create a spring animation for smooth transitions
  const spring = useSpring(value, {
    stiffness: 100,
    damping: 15,
    duration: prefersReducedMotion ? 0 : duration
  });

  // Transform the spring value to formatted string
  const display = useTransform(spring, (latest) => 
    latest.toFixed(decimals)
  );

  // Update spring when value changes
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span 
      className={className}
      style={{ display: 'inline-block', minWidth: '1ch' }}
    >
      {display}
    </motion.span>
  );
}
