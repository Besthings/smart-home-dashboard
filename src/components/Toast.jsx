import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../utils/useReducedMotion';

function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      default: // info
        return {
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/50',
          text: 'text-cyan-400',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  // Create accessible label for screen readers
  const ariaLabel = `${type} notification: ${message}`;

  // Handle keyboard events for dismissal
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: 100, scale: 0.8 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: 100, scale: 0.8 }}
      transition={prefersReducedMotion ? {} : { duration: 0.25, ease: 'easeOut' }}
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 shadow-lg cursor-pointer`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="alert"
      aria-live="polite"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.text} flex-shrink-0 mt-0.5`}>
          {styles.icon}
        </div>
        <p className={`${styles.text} text-sm flex-1`}>{message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default Toast;
