import { motion } from 'framer-motion';
import { FaSkull, FaUpload, FaCrown, FaFire } from 'react-icons/fa';
import { GiDeathSkull, GiCrossedBones } from 'react-icons/gi';
import { useBossProgress } from '../context/BossProgressContext';
import { cn } from '../../../lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Progress bar with torn paper effect and thematic styling
 */
function TornProgressBar({ current, total, className }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className={cn("relative h-8 w-full max-w-md", className)}>
      {/* Paper background with torn edges */}
      <div className="absolute inset-0 bg-[#f4e4bc] border-2 border-[#4a2c10] shadow-inner overflow-hidden">
        {/* Torn edge effect top */}
        <div 
          className="absolute -top-1 left-0 right-0 h-2 bg-[#d4c5a9]"
          style={{
            clipPath: 'polygon(0 100%, 3% 0, 6% 100%, 9% 0, 12% 100%, 15% 0, 18% 100%, 21% 0, 24% 100%, 27% 0, 30% 100%, 33% 0, 36% 100%, 39% 0, 42% 100%, 45% 0, 48% 100%, 51% 0, 54% 100%, 57% 0, 60% 100%, 63% 0, 66% 100%, 69% 0, 72% 100%, 75% 0, 78% 100%, 81% 0, 84% 100%, 87% 0, 90% 100%, 93% 0, 96% 100%, 100% 0, 100% 100%)'
          }}
        />
        
        {/* Progress fill */}
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8b0000] via-[#b91c1c] to-[#8b0000]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          {/* Blood drip effect on the right edge */}
          <div 
            className="absolute right-0 top-full w-3 h-4 bg-[#8b0000]"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              animation: 'drip 2s ease-in-out infinite'
            }}
          />
        </motion.div>
        
        {/* Ink splatter overlay */}
        <div className="absolute inset-0 bg-noise opacity-10 mix-blend-multiply pointer-events-none" />
        
        {/* Torn edge effect bottom */}
        <div 
          className="absolute -bottom-1 left-0 right-0 h-2 bg-[#d4c5a9]"
          style={{
            clipPath: 'polygon(0 0, 3% 100%, 6% 0, 9% 100%, 12% 0, 15% 100%, 18% 0, 21% 100%, 24% 0, 27% 100%, 30% 0, 33% 100%, 36% 0, 39% 100%, 42% 0, 45% 100%, 48% 0, 51% 100%, 54% 0, 57% 100%, 60% 0, 63% 100%, 66% 0, 69% 100%, 72% 0, 75% 100%, 78% 0, 81% 100%, 84% 0, 87% 100%, 90% 0, 93% 100%, 96% 0, 100% 100%, 100% 0, 0% 0%)'
          }}
        />
      </div>
      
      {/* Skull markers for milestones */}
      {[25, 50, 75].map((milestone) => (
        <div 
          key={milestone}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-500",
            percentage >= milestone ? "text-[#fbbf24] scale-110" : "text-[#4a2c10]/30"
          )}
          style={{ left: `${milestone}%`, transform: 'translateX(-50%) translateY(-50%)' }}
        >
          <GiCrossedBones className="w-full h-full drop-shadow-sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Stat badge component
 */
function StatBadge({ icon: Icon, label, value, variant = 'default' }) {
  const variants = {
    default: 'bg-[#f4e4bc] text-[#2a1a10] border-[#4a2c10]',
    blood: 'bg-[#8b0000] text-[#f4e4bc] border-[#5c0000]',
    gold: 'bg-[#fbbf24] text-[#2a1a10] border-[#b45309]'
  };
  
  return (
    <motion.div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 border-2 font-handwriting text-sm",
        "shadow-[2px_2px_0_rgba(0,0,0,0.3)] transform hover:rotate-1 transition-transform",
        variants[variant]
      )}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Icon className="w-4 h-4" />
      <span className="font-bold">{value}</span>
      <span className="opacity-70 text-xs uppercase tracking-wide">{label}</span>
    </motion.div>
  );
}

/**
 * Connect progress CTA when no save is loaded
 */
function ConnectProgressCTA() {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <Link 
        to="/parser"
        className={cn(
          "inline-flex items-center gap-3 px-6 py-3",
          "bg-[#f4e4bc] text-[#2a1a10] border-4 border-[#4a2c10]",
          "font-handwriting text-xl font-bold uppercase tracking-wider",
          "shadow-[4px_4px_0_rgba(0,0,0,0.4)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.4)]",
          "hover:translate-x-0.5 hover:translate-y-0.5",
          "transition-all duration-200 transform rotate-[-1deg] hover:rotate-0"
        )}
      >
        <FaUpload className="w-5 h-5" />
        <span>{t('bosses.connectProgress', 'Connect Your Progress')}</span>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#8b0000] rounded-full animate-pulse" />
      </Link>
      
      {/* Tape decoration */}
      <div className="absolute -top-3 left-8 w-16 h-5 bg-[#e0d8c3]/80 rotate-[-3deg] shadow-sm" />
    </motion.div>
  );
}

/**
 * Main Progress Header Component
 * Shows user's boss hunting progress with thematic styling
 */
export function ProgressHeader({ bossList = [] }) {
  const { t } = useTranslation();
  const { 
    isLoading, 
    hasSaveLoaded, 
    getOverallProgress 
  } = useBossProgress();

  const progress = getOverallProgress(bossList);
  const { total, defeated, hardComplete, mastered, percentage } = progress;

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin text-[#8b0000]">
          <FaSkull className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="relative mb-8 md:mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Wooden plaque background */}
      <div className="relative bg-gradient-to-b from-[#4a2c10] to-[#2a1a10] rounded-lg p-6 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.5)]">
        {/* Wood grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 rounded-lg pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 51px)'
          }}
        />
        
        {/* Nails in corners */}
        {[['-top-2 -left-2'], ['-top-2 -right-2'], ['-bottom-2 -left-2'], ['-bottom-2 -right-2']].map((pos, i) => (
          <div 
            key={i}
            className={cn(
              "absolute w-4 h-4 rounded-full bg-[#555] border-2 border-[#333] shadow-md z-10",
              pos[0]
            )}
          >
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-[#888]" />
          </div>
        ))}

        <div className="relative z-10">
          {hasSaveLoaded ? (
            <>
              {/* Progress Title */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <GiDeathSkull className="w-8 h-8 text-[#8b0000]" />
                  <h2 className="font-heading text-2xl sm:text-3xl text-[#f4e4bc] uppercase tracking-wider">
                    {t('bosses.huntProgress', 'Hunt Progress')}
                  </h2>
                </div>
                
                {/* Progress counter */}
                <motion.div 
                  className="flex items-baseline gap-2 font-heading text-[#f4e4bc]"
                  key={defeated}
                >
                  <motion.span 
                    className="text-4xl sm:text-5xl text-[#fbbf24]"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {defeated}
                  </motion.span>
                  <span className="text-2xl opacity-60">/</span>
                  <span className="text-2xl">{total}</span>
                  <span className="text-lg ml-2 opacity-70 uppercase tracking-wide">
                    {t('bosses.defeated', 'Defeated')}
                  </span>
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="flex justify-center mb-4">
                <TornProgressBar current={defeated} total={total} />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-3">
                <StatBadge 
                  icon={FaFire} 
                  label={t('bosses.hardMode', 'Hard')} 
                  value={hardComplete} 
                  variant="blood"
                />
                <StatBadge 
                  icon={FaCrown} 
                  label={t('bosses.mastered', 'Mastered')} 
                  value={mastered} 
                  variant="gold"
                />
                <StatBadge 
                  icon={FaSkull} 
                  label={t('bosses.completion', 'Complete')} 
                  value={`${percentage}%`} 
                  variant="default"
                />
              </div>
            </>
          ) : (
            /* No save loaded state */
            <div className="flex flex-col items-center justify-center py-4 gap-4">
              <div className="flex items-center gap-3 text-[#f4e4bc]/60">
                <GiDeathSkull className="w-6 h-6" />
                <p className="font-handwriting text-lg">
                  {t('bosses.noProgress', 'Track your boss kills by uploading your save')}
                </p>
              </div>
              <ConnectProgressCTA />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProgressHeader;
