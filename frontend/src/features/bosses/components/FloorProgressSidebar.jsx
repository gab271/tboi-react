import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaMapMarkerAlt, FaCheck, FaLock, FaChevronRight } from 'react-icons/fa';
import { GiCrossedBones, GiSkullCrossedBones, GiTombstone, GiBabyFace } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import { useBossProgress } from '../context/BossProgressContext';
import { ALL_FLOORS } from '../types/boss.types';
import { useMemo } from 'react';

/**
 * Floor icons for visual variety
 */
const FLOOR_ICONS = {
  basement: GiBabyFace,
  cellar: GiBabyFace,
  caves: GiTombstone,
  catacombs: GiTombstone,
  depths: GiSkullCrossedBones,
  necropolis: GiSkullCrossedBones,
  womb: GiCrossedBones,
  utero: GiCrossedBones,
  sheol: GiSkullCrossedBones,
  cathedral: FaCheck,
  'dark-room': GiTombstone,
  chest: FaCheck,
  void: GiSkullCrossedBones,
  home: FaCheck,
  hush: GiCrossedBones,
  corpse: GiTombstone,
  default: FaMapMarkerAlt
};

/**
 * Get icon for floor
 */
function getFloorIcon(floorId) {
  const normalizedId = floorId?.toLowerCase().replace(/\s+/g, '-') || 'default';
  return FLOOR_ICONS[normalizedId] || FLOOR_ICONS.default;
}

/**
 * Mini progress bar for floor
 */
function FloorProgressBar({ defeated, total, hardComplete }) {
  const percentage = total > 0 ? (defeated / total) * 100 : 0;
  const hardPercentage = total > 0 ? (hardComplete / total) * 100 : 0;
  
  return (
    <div className="relative h-2 w-full bg-[#4a2c10]/30 rounded-full overflow-hidden mt-1">
      {/* Hard mode (behind) */}
      <motion.div 
        className="absolute inset-y-0 left-0 bg-[#1a1a1a]"
        initial={{ width: 0 }}
        animate={{ width: `${hardPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Normal mode */}
      <motion.div 
        className="absolute inset-y-0 left-0 bg-[#8b0000]"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

/**
 * Individual floor item in sidebar
 */
function FloorItem({ floor, progress, active, onClick }) {
  const Icon = getFloorIcon(floor.id);
  const isComplete = progress.percentage === 100;
  const hasProgress = progress.defeated > 0;
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative w-full text-left px-4 py-3 transition-all duration-200",
        "hover:bg-[#4a2c10]/10"
      )}
      whileHover={{ x: 4 }}
    >
      {/* Selection indicator */}
      {active && (
        <motion.div 
          layoutId="floor-selection"
          className="absolute inset-y-1 left-0 w-1 bg-[#8b0000] rounded-r"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      
      <div className="flex items-center gap-3">
        {/* Floor icon */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
          active ? "bg-[#8b0000] text-[#f4e4bc]" : 
          isComplete ? "bg-[#fbbf24] text-[#2a1a10]" :
          "bg-[#f4e4bc] text-[#4a2c10]"
        )}>
          {isComplete ? <FaCheck className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        
        {/* Floor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "font-handwriting text-base truncate",
              active ? "font-bold text-[#8b0000]" : "text-[#2a1a10]"
            )}>
              {floor.name}
            </span>
            
            {/* Progress counter */}
            <span className={cn(
              "font-heading text-sm shrink-0",
              isComplete ? "text-[#fbbf24]" : 
              hasProgress ? "text-[#8b0000]" : "text-[#4a2c10]/50"
            )}>
              {progress.defeated}/{progress.total}
            </span>
          </div>
          
          {/* Progress bar */}
          {progress.total > 0 && (
            <FloorProgressBar 
              defeated={progress.defeated}
              total={progress.total}
              hardComplete={progress.hardComplete}
            />
          )}
        </div>
        
        {/* Chevron */}
        <FaChevronRight className={cn(
          "w-3 h-3 transition-all shrink-0",
          active ? "text-[#8b0000] translate-x-1" : "text-[#4a2c10]/30"
        )} />
      </div>
    </motion.button>
  );
}

/**
 * Overall progress section
 */
function OverallProgressSection({ totalProgress }) {
  const { t } = useTranslation();
  const { defeated, total, percentage, hardComplete, mastered } = totalProgress;
  
  return (
    <div className="p-4 bg-gradient-to-br from-[#4a2c10] to-[#2a1a10] text-[#f4e4bc] relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\' fill=\'%23fff\'/%3E%3C/svg%3E")'
        }}
      />
      
      <div className="relative">
        <h4 className="font-heading text-sm uppercase tracking-wider text-[#f4e4bc]/60 mb-2">
          {t('bosses.totalProgress', 'Total Progress')}
        </h4>
        
        {/* Main percentage */}
        <div className="flex items-baseline gap-2 mb-3">
          <motion.span 
            className="font-heading text-4xl text-[#fbbf24]"
            key={percentage}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {percentage}%
          </motion.span>
          <span className="text-lg text-[#f4e4bc]/60">
            ({defeated}/{total})
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden mb-3">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#8b0000] via-[#dc2626] to-[#fbbf24]"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        {/* Stats row */}
        <div className="flex justify-between text-xs">
          <span className="text-[#f4e4bc]/60">
            <span className="text-white font-bold">{hardComplete}</span> Hard
          </span>
          <span className="text-[#f4e4bc]/60">
            <span className="text-[#fbbf24] font-bold">{mastered}</span> Mastered
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Floor Progress Sidebar Component
 * Shows per-floor progress with interactive navigation
 */
export function FloorProgressSidebar({ 
  activeFloor, 
  setActiveFloor, 
  bossList = [],
  className 
}) {
  const { t } = useTranslation();
  const { getFloorProgress, getOverallProgress, hasSaveLoaded } = useBossProgress();
  
  // Calculate floor progress
  const floorProgress = useMemo(() => 
    getFloorProgress(bossList), 
    [getFloorProgress, bossList]
  );
  
  // Calculate overall progress
  const overallProgress = useMemo(() => 
    getOverallProgress(bossList),
    [getOverallProgress, bossList]
  );
  
  // Filter floors that have bosses
  const floorsWithBosses = useMemo(() => 
    ALL_FLOORS.filter(floor => floorProgress[floor.id]?.total > 0),
    [floorProgress]
  );
  
  const handleFloorClick = (floorId) => {
    setActiveFloor(prev => prev === floorId ? 'all' : floorId);
  };

  return (
    <div className={cn(
      "hidden lg:flex flex-col w-72 sticky top-24 shrink-0 select-none",
      className
    )}>
      {/* Tape decoration */}
      <div className="mx-auto w-20 h-5 bg-[#e0d8c3]/80 rotate-1 shadow-sm mb-2 z-10" />
      
      <div className="relative bg-[#fdfbf7] shadow-lg overflow-hidden">
        {/* Paper texture */}
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
        
        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-[#4a2c10]/20 flex items-center gap-2">
          <FaMapMarkerAlt className="w-5 h-5 text-[#8b0000]" />
          <h3 className="font-heading text-xl text-[#2a1a10] uppercase tracking-wide">
            {t('bosses.floorMap', 'Floor Map')}
          </h3>
        </div>
        
        {/* Overall Progress */}
        {hasSaveLoaded && <OverallProgressSection totalProgress={overallProgress} />}
        
        {/* Floor List */}
        <div className="divide-y divide-[#4a2c10]/10">
          {/* All floors option */}
          <motion.button
            onClick={() => setActiveFloor('all')}
            className={cn(
              "w-full text-left px-4 py-3 transition-all duration-200",
              "hover:bg-[#4a2c10]/10 flex items-center gap-3"
            )}
            whileHover={{ x: 4 }}
          >
            {activeFloor === 'all' && (
              <motion.div 
                layoutId="floor-selection"
                className="absolute left-0 w-1 h-10 bg-[#8b0000] rounded-r"
              />
            )}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              activeFloor === 'all' ? "bg-[#8b0000] text-[#f4e4bc]" : "bg-[#f4e4bc] text-[#4a2c10]"
            )}>
              ★
            </div>
            <span className={cn(
              "font-handwriting text-base flex-1",
              activeFloor === 'all' ? "font-bold text-[#8b0000]" : "text-[#2a1a10]"
            )}>
              {t('bosses.allFloors', 'All Floors')}
            </span>
            <FaChevronRight className={cn(
              "w-3 h-3",
              activeFloor === 'all' ? "text-[#8b0000]" : "text-[#4a2c10]/30"
            )} />
          </motion.button>
          
          {/* Individual floors */}
          <AnimatePresence>
            {floorsWithBosses.map((floor, index) => (
              <motion.div
                key={floor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FloorItem
                  floor={floor}
                  progress={floorProgress[floor.id] || { total: 0, defeated: 0, hardComplete: 0, percentage: 0 }}
                  active={activeFloor === floor.id}
                  onClick={() => handleFloorClick(floor.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Not logged in hint */}
        {!hasSaveLoaded && (
          <div className="p-4 bg-[#fbbf24]/10 border-t-2 border-[#4a2c10]/20">
            <p className="font-handwriting text-xs text-[#4a2c10]/70 text-center">
              {t('bosses.uploadHint', 'Upload your save to track progress per floor')}
            </p>
          </div>
        )}
        
        {/* Decorative bottom torn edge */}
        <div 
          className="h-4 bg-[#fdfbf7]"
          style={{
            clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
          }}
        />
      </div>
      
      {/* Compass rose decoration */}
      <div className="mx-auto mt-4 opacity-20">
        <svg width="60" height="60" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="#4a2c10" strokeWidth="2" fill="none" />
          <path d="M50 10 L55 50 L50 90 L45 50 Z" fill="#4a2c10" />
          <path d="M10 50 L50 45 L90 50 L50 55 Z" fill="#4a2c10" />
          <text x="50" y="25" textAnchor="middle" fontSize="10" fill="#4a2c10">N</text>
        </svg>
      </div>
    </div>
  );
}

export default FloorProgressSidebar;
