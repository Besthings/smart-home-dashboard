import { useMemo } from 'react';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * GaugeChart - A circular gauge visualization component
 * @param {number} value - Current value to display
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} unit - Unit label (e.g., "ppm", "V")
 * @param {string} label - Gauge label
 * @param {number} dangerThreshold - Value at which gauge turns red
 * @param {number} warningThreshold - Value at which gauge turns yellow
 * @param {'sm'|'md'|'lg'|'xl'} size - Size variant
 * @param {boolean} animated - Enable/disable animations
 */
export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  unit = '',
  label = '',
  dangerThreshold,
  warningThreshold,
  size = 'md',
  animated = true
}) {
  const prefersReducedMotion = useReducedMotion();
  // Size configurations - responsive sizes
  const sizeConfig = {
    sm: { 
      width: 100, 
      height: 100, 
      strokeWidth: 6, 
      fontSize: '1rem', 
      labelSize: '0.625rem',
      // Mobile sizes
      mobileWidth: 90,
      mobileHeight: 90,
      mobileStrokeWidth: 5,
      mobileFontSize: '0.875rem',
      mobileLabelSize: '0.5rem'
    },
    md: { 
      width: 160, 
      height: 160, 
      strokeWidth: 10, 
      fontSize: '1.75rem', 
      labelSize: '0.875rem',
      // Mobile sizes
      mobileWidth: 120,
      mobileHeight: 120,
      mobileStrokeWidth: 8,
      mobileFontSize: '1.25rem',
      mobileLabelSize: '0.75rem'
    },
    lg: { 
      width: 200, 
      height: 200, 
      strokeWidth: 12, 
      fontSize: '2.25rem', 
      labelSize: '1rem',
      // Mobile sizes
      mobileWidth: 150,
      mobileHeight: 150,
      mobileStrokeWidth: 10,
      mobileFontSize: '1.75rem',
      mobileLabelSize: '0.875rem'
    },
    xl: { 
      width: 280, 
      height: 280, 
      strokeWidth: 16, 
      fontSize: '3rem', 
      labelSize: '1.25rem',
      // Mobile sizes
      mobileWidth: 180,
      mobileHeight: 180,
      mobileStrokeWidth: 12,
      mobileFontSize: '2rem',
      mobileLabelSize: '1rem'
    }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage and arc length
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const arcLength = (percentage / 100) * circumference;

  // Determine color based on thresholds
  const getColor = useMemo(() => {
    if (dangerThreshold !== undefined && value >= dangerThreshold) {
      return '#ef4444'; // red-500
    }
    if (warningThreshold !== undefined && value >= warningThreshold) {
      return '#f59e0b'; // amber-500
    }
    return '#10b981'; // green-500
  }, [value, dangerThreshold, warningThreshold]);

  // Create accessible label for screen readers
  const ariaLabel = `${label || 'Gauge'}: ${value !== null && value !== undefined ? value.toFixed(1) : 'no data'} ${unit}. ${
    dangerThreshold !== undefined && value >= dangerThreshold ? 'Danger level' :
    warningThreshold !== undefined && value >= warningThreshold ? 'Warning level' :
    'Normal level'
  }`;

  return (
    <div 
      className="flex flex-col items-center gap-2 w-full" 
      role="img" 
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="transform -rotate-90 max-w-full h-auto"
        style={{
          maxWidth: `${config.width}px`,
          maxHeight: `${config.height}px`
        }}
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke="#334155"
          strokeWidth={config.strokeWidth}
        />
        
        {/* Animated arc */}
        <circle
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="none"
          stroke={getColor}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - arcLength}
          style={{
            transition: animated && !prefersReducedMotion ? 'stroke-dashoffset 0.8s ease-out' : 'none'
          }}
        />
        
        {/* Center value display */}
        <text
          x={config.width / 2}
          y={config.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(90, ${config.width / 2}, ${config.height / 2})`}
          style={{
            fontSize: config.fontSize,
            fontWeight: 'bold',
            fill: '#f8fafc'
          }}
        >
          {value !== null && value !== undefined ? value.toFixed(1) : '--'}
        </text>
        
        {/* Unit label */}
        {unit && (
          <text
            x={config.width / 2}
            y={config.height / 2 + (size === 'xl' ? 28 : size === 'lg' ? 24 : size === 'md' ? 20 : 16)}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(90, ${config.width / 2}, ${config.height / 2})`}
            style={{
              fontSize: config.labelSize,
              fill: '#cbd5e1'
            }}
          >
            {unit}
          </text>
        )}
      </svg>
      
      {/* Label below gauge */}
      {label && (
        <p className="text-xs sm:text-sm text-slate-400 text-center">{label}</p>
      )}
    </div>
  );
}
