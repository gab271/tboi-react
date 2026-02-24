import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaCrown, FaLock, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFeatures } from '../../../hooks/useFeatures';

/**
 * PRO badge component for inline feature indicators
 */
export function ProBadge({ className, size = 'sm' }) {
  const sizes = {
    xs: 'text-[8px] px-1 py-0.5',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1'
  };
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-bold rounded",
      "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#2a1a10]",
      sizes[size],
      className
    )}>
      <FaCrown className="w-2.5 h-2.5" />
      PRO
    </span>
  );
}

/**
 * PRO feature lock overlay
 */
export function ProFeatureLock({ 
  feature,
  children,
  className,
  showPreview = true 
}) {
  const { t } = useTranslation();
  const { hasPremium, getUpgradeInfo } = useFeatures();
  
  if (hasPremium) {
    return children;
  }
  
  const upgradeInfo = getUpgradeInfo(feature);
  
  return (
    <div className={cn("relative", className)}>
      {/* Blurred preview */}
      {showPreview && (
        <div className="blur-[2px] opacity-60 pointer-events-none select-none">
          {children}
        </div>
      )}
      
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2a1a10]/40 backdrop-blur-sm">
        <motion.div
          className="text-center p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f4e4bc] flex items-center justify-center">
            <FaLock className="w-8 h-8 text-[#4a2c10]" />
          </div>
          
          <h4 className="font-heading text-xl text-[#f4e4bc] mb-2">
            {t('pro.featureLocked', 'PRO Feature')}
          </h4>
          
          <p className="font-handwriting text-sm text-[#f4e4bc]/80 mb-4 max-w-xs">
            {upgradeInfo?.description || t('pro.upgradeToUnlock', 'Upgrade to PRO to unlock this feature')}
          </p>
          
          <Link
            to="/upgrade"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2",
              "bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#2a1a10]",
              "font-heading text-sm uppercase tracking-wider",
              "shadow-lg hover:shadow-xl transition-shadow"
            )}
          >
            <FaStar className="w-4 h-4" />
            {t('pro.upgrade', 'Upgrade to PRO')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * PRO insight section with subtle badge
 */
export function ProInsightSection({ 
  title, 
  children, 
  className 
}) {
  const { hasPremium } = useFeatures();
  
  return (
    <div className={cn(
      "relative p-4 border-2 border-dashed",
      hasPremium 
        ? "border-[#fbbf24]/50 bg-[#fbbf24]/5" 
        : "border-[#4a2c10]/30 bg-[#4a2c10]/5",
      className
    )}>
      {/* PRO badge */}
      <div className="absolute -top-3 left-4">
        <ProBadge size="sm" />
      </div>
      
      {title && (
        <h4 className="font-heading text-lg text-[#2a1a10] mb-3 mt-1">
          {title}
        </h4>
      )}
      
      {hasPremium ? (
        children
      ) : (
        <div className="text-center py-4">
          <FaLock className="w-6 h-6 mx-auto mb-2 text-[#4a2c10]/40" />
          <p className="font-handwriting text-sm text-[#4a2c10]/60">
            PRO insight available
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Subtle PRO upsell banner (non-intrusive)
 */
export function ProUpsellBanner({ className }) {
  const { t } = useTranslation();
  const { hasPremium } = useFeatures();
  
  if (hasPremium) return null;
  
  return (
    <motion.div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3",
        "bg-gradient-to-r from-[#4a2c10] to-[#2a1a10]",
        "border-t-2 border-[#fbbf24]",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#fbbf24] flex items-center justify-center">
          <FaCrown className="w-5 h-5 text-[#2a1a10]" />
        </div>
        <div>
          <p className="font-handwriting text-sm text-[#f4e4bc]">
            {t('pro.upsellMessage', 'Unlock strategies, stats, and more')}
          </p>
        </div>
      </div>
      
      <Link
        to="/upgrade"
        className={cn(
          "shrink-0 px-3 py-1.5",
          "bg-[#fbbf24] text-[#2a1a10]",
          "font-handwriting text-sm font-bold",
          "hover:bg-[#f59e0b] transition-colors"
        )}
      >
        {t('pro.learnMore', 'Learn More')}
      </Link>
    </motion.div>
  );
}

export default {
  ProBadge,
  ProFeatureLock,
  ProInsightSection,
  ProUpsellBanner
};
