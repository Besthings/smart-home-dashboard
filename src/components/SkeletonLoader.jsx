/**
 * SkeletonLoader - Loading placeholder with shimmer animation
 * @param {'card'|'text'|'circle'|'gauge'} variant - Type of skeleton to display
 * @param {number} count - Number of skeleton elements to render (default: 1)
 * @param {string} className - Additional CSS classes
 */
export default function SkeletonLoader({ variant = 'card', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const getSkeletonElement = (index) => {
    const baseClasses = 'animate-shimmer bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]';
    
    switch (variant) {
      case 'card':
        return (
          <div 
            key={index}
            className={`${baseClasses} rounded-xl p-6 h-48 ${className}`}
          >
            <div className="h-6 w-32 bg-slate-600 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-600 rounded w-3/4"></div>
              <div className="h-4 bg-slate-600 rounded w-1/2"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div 
            key={index}
            className={`${baseClasses} h-4 rounded ${className}`}
          />
        );
      
      case 'circle':
        return (
          <div 
            key={index}
            className={`${baseClasses} rounded-full w-12 h-12 ${className}`}
          />
        );
      
      case 'gauge':
        return (
          <div 
            key={index}
            className={`flex flex-col items-center gap-2 ${className}`}
          >
            <div className={`${baseClasses} rounded-full w-40 h-40`} />
            <div className={`${baseClasses} h-4 w-24 rounded`} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {skeletons.map((index) => getSkeletonElement(index))}
    </>
  );
}
