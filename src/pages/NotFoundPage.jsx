import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticlesBackground from '../components/ParticlesBackground';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * NotFoundPage - Custom 404 error page
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  // Page animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Animation variants for the 404 illustration
  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  const floatVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground density="low" color="#06b6d4" opacity={0.3} />

      {/* Content Container */}
      <motion.div
        className="relative z-10 text-center max-w-2xl w-full"
        variants={prefersReducedMotion ? {} : pageVariants}
        initial={prefersReducedMotion ? {} : "initial"}
        animate={prefersReducedMotion ? {} : "animate"}
        exit={prefersReducedMotion ? {} : "exit"}
      >
        {/* Animated 404 Illustration */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {/* First "4" */}
          <motion.div
            custom={0}
            variants={prefersReducedMotion ? {} : numberVariants}
            initial={prefersReducedMotion ? {} : "hidden"}
            animate={prefersReducedMotion ? {} : "visible"}
            className="relative"
          >
            <motion.div
              variants={prefersReducedMotion ? {} : floatVariants}
              animate={prefersReducedMotion ? {} : "float"}
              className="text-9xl md:text-[12rem] font-bold text-cyan-400 leading-none"
              style={{
                textShadow: '0 0 40px rgba(6, 182, 212, 0.5)',
              }}
            >
              4
            </motion.div>
          </motion.div>

          {/* "0" with icon inside */}
          <motion.div
            custom={1}
            variants={prefersReducedMotion ? {} : numberVariants}
            initial={prefersReducedMotion ? {} : "hidden"}
            animate={prefersReducedMotion ? {} : "visible"}
            className="relative"
          >
            <motion.div
              variants={prefersReducedMotion ? {} : floatVariants}
              animate={prefersReducedMotion ? {} : "float"}
              style={{ animationDelay: '1s' }}
              className="relative"
            >
              <div
                className="text-9xl md:text-[12rem] font-bold text-cyan-400 leading-none"
                style={{
                  textShadow: '0 0 40px rgba(6, 182, 212, 0.5)',
                }}
              >
                0
              </div>
              {/* Home icon inside the "0" */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-16 h-16 md:w-20 md:h-20 text-cyan-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </motion.div>
          </motion.div>

          {/* Second "4" */}
          <motion.div
            custom={2}
            variants={prefersReducedMotion ? {} : numberVariants}
            initial={prefersReducedMotion ? {} : "hidden"}
            animate={prefersReducedMotion ? {} : "visible"}
            className="relative"
          >
            <motion.div
              variants={prefersReducedMotion ? {} : floatVariants}
              animate={prefersReducedMotion ? {} : "float"}
              className="text-9xl md:text-[12rem] font-bold text-cyan-400 leading-none"
              style={{
                animationDelay: '2s',
                textShadow: '0 0 40px rgba(6, 182, 212, 0.5)',
              }}
            >
              4
            </motion.div>
          </motion.div>
        </div>

        {/* Error Message */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { delay: 0.6, duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-slate-400 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-slate-500">
            It might have been moved or deleted, or you may have mistyped the URL.
          </p>
        </motion.div>

        {/* Return to Dashboard Button */}
        <motion.button
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? {} : { delay: 0.8, duration: 0.3 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={handleReturnToDashboard}
          aria-label="Return to dashboard"
          className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg button-hover shadow-lg hover:shadow-cyan-500/50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Return to Dashboard
        </motion.button>

        {/* Decorative Elements */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          transition={prefersReducedMotion ? {} : { delay: 1, duration: 0.5 }}
          className="mt-12 flex items-center justify-center gap-2 text-slate-600"
        >
          <div className="h-px w-16 bg-slate-700"></div>
          <span className="text-sm">Error 404</span>
          <div className="h-px w-16 bg-slate-700"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
