import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * SensorCard - Modernized sensor card with hover effects and animations
 * @param {string} title - Card title
 * @param {React.ReactNode} icon - Optional icon element
 * @param {React.ReactNode} children - Card content
 * @param {boolean} alert - Whether to show alert/pulse animation
 * @param {string} className - Additional CSS classes
 */
export default function SensorCard({ 
  title, 
  icon, 
  children, 
  alert = false, 
  className = '' 
}) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div
      className={`
        bg-gradient-to-br from-slate-800 to-slate-900 
        rounded-xl p-4 sm:p-6 
        shadow-lg
        transition-all duration-250
        card-hover
        ${alert && !prefersReducedMotion ? 'pulse-fast' : ''}
        ${className}
      `}
      style={{
        opacity: prefersReducedMotion ? 1 : undefined,
        animation: prefersReducedMotion ? 'none' : 'fade-in 0.4s ease-out forwards'
      }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        {icon && (
          <div className="text-cyan-400">
            {icon}
          </div>
        )}
        <h3 className="text-base sm:text-lg font-semibold text-slate-100">
          {title}
        </h3>
      </div>

      {/* Card Content */}
      <div className="text-slate-300">
        {children}
      </div>
    </div>
  );
}
