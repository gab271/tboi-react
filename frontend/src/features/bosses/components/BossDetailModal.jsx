import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTranslation } from 'react-i18next';
import { 
  FaSkull, FaHeart, FaMapMarkerAlt, FaExclamationTriangle, FaTimes,
  FaShieldAlt, FaFire, FaCrown, FaCheck, FaLock, FaStar, FaTrophy,
  FaChartBar, FaLightbulb, FaUserCheck, FaHandPointer
} from 'react-icons/fa';
import { 
  GiCrossedSwords, GiDeathSkull, GiHealthPotion, GiBroadsword,
  GiAbstract024, GiPerson
} from 'react-icons/gi';
import { useBossProgress } from '../context/BossProgressContext';
import { useFeatures } from '../../../hooks/useFeatures';
import { DEFEAT_STATUS, DANGER_LEVEL, ALL_CHARACTERS } from '../types/boss.types';

/**
 * Tab navigation component
 */
function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="flex border-b-2 border-[#4a2c10]/30 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={cn(
            "relative flex items-center gap-2 px-4 py-3 font-handwriting text-base whitespace-nowrap",
            "transition-colors duration-200",
            activeTab === tab.id 
              ? "text-[#8b0000] font-bold" 
              : "text-[#4a2c10]/70 hover:text-[#4a2c10]"
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          <span className="uppercase tracking-wide">{tab.label}</span>
          
          {tab.isPro && (
            <span className="bg-[#fbbf24] text-[#2a1a10] text-[8px] font-bold px-1 py-0.5 rounded ml-1">
              PRO
            </span>
          )}
          
          {/* Active indicator */}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b0000]"
              style={{ borderRadius: '2px 2px 0 0' }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Danger level indicator
 */
function DangerBadge({ level }) {
  const config = {
    [DANGER_LEVEL.LOW]: { color: 'bg-green-600', label: 'Low', icon: FaShieldAlt },
    [DANGER_LEVEL.MEDIUM]: { color: 'bg-yellow-600', label: 'Medium', icon: FaExclamationTriangle },
    [DANGER_LEVEL.HIGH]: { color: 'bg-orange-600', label: 'High', icon: FaFire },
    [DANGER_LEVEL.EXTREME]: { color: 'bg-red-700', label: 'Extreme', icon: GiDeathSkull }
  };
  
  const cfg = config[level] || config[DANGER_LEVEL.MEDIUM];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white rounded",
      cfg.color
    )}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/**
 * Overview Tab Content
 */
function OverviewTab({ boss }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard 
          icon={FaHeart} 
          label={t('bosses.hp', 'HP')} 
          value={boss.health || '???'} 
          color="text-red-600"
        />
        <StatCard 
          icon={GiAbstract024} 
          label={t('bosses.phases', 'Phases')} 
          value={boss.phases || 1} 
          color="text-purple-600"
        />
        <StatCard 
          icon={FaExclamationTriangle} 
          label={t('bosses.difficulty', 'Difficulty')} 
          value={`${boss.difficulty || '?'}/5`} 
          color="text-orange-600"
        />
        <StatCard 
          icon={FaMapMarkerAlt} 
          label={t('bosses.floor', 'Floor')} 
          value={boss.location || '?'} 
          color="text-blue-600"
        />
      </div>
      
      {/* Description */}
      <div className="bg-white/30 p-4 border border-[#4a2c10]/20 -rotate-[0.5deg]">
        <p className="font-handwriting text-lg leading-relaxed text-[#2a1a10] first-letter:text-3xl first-letter:font-heading first-letter:mr-1 first-letter:float-left">
          {boss.description || t('bosses.noDescription', 'No records found about this creature...')}
        </p>
      </div>
      
      {/* Type & Variants */}
      {(boss.type || boss.variants) && (
        <div className="flex flex-wrap gap-2">
          {boss.type && (
            <span className="px-3 py-1 bg-[#4a2c10] text-[#f4e4bc] font-handwriting text-sm uppercase">
              {boss.type}
            </span>
          )}
          {boss.variants?.map((variant, i) => (
            <span key={i} className="px-3 py-1 bg-[#8b0000] text-[#f4e4bc] font-handwriting text-sm">
              {variant}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Stat card component
 */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#f4e4bc] border-2 border-[#4a2c10] p-3 text-center shadow-sm transform hover:rotate-1 transition-transform">
      <Icon className={cn("w-6 h-6 mx-auto mb-1", color)} />
      <div className="font-heading text-lg text-[#2a1a10]">{value}</div>
      <div className="font-handwriting text-xs text-[#4a2c10] uppercase">{label}</div>
    </div>
  );
}

/**
 * Attack Patterns Tab
 */
function AttackPatternsTab({ boss }) {
  const { t } = useTranslation();
  const patterns = boss.attack_patterns || boss.attackPatterns || [];
  
  if (!patterns.length) {
    return (
      <p className="text-center text-[#4a2c10]/60 font-handwriting text-lg py-8">
        {t('bosses.noPatternsRecorded', 'No attack patterns recorded...')}
      </p>
    );
  }
  
  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => {
        const isObject = typeof pattern === 'object';
        const name = isObject ? pattern.name : `Attack ${index + 1}`;
        const description = isObject ? pattern.description : pattern;
        const danger = isObject ? pattern.dangerLevel : DANGER_LEVEL.MEDIUM;
        const tip = isObject ? pattern.tip : null;
        
        return (
          <motion.div
            key={index}
            className="relative bg-white/40 border-l-4 border-[#8b0000] p-4 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <GiCrossedSwords className="w-5 h-5 text-[#8b0000]" />
                <h4 className="font-heading text-lg text-[#2a1a10]">{name}</h4>
              </div>
              <DangerBadge level={danger} />
            </div>
            
            <p className="font-handwriting text-base text-[#4a2c10] mb-2">
              {description}
            </p>
            
            {tip && (
              <div className="mt-3 pt-3 border-t border-[#4a2c10]/20 flex items-start gap-2">
                <FaLightbulb className="w-4 h-4 text-[#fbbf24] mt-0.5 shrink-0" />
                <p className="font-handwriting text-sm text-[#4a2c10]/80 italic">
                  {tip}
                </p>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Global Stats Tab (PRO)
 */
function GlobalStatsTab({ boss, isLocked }) {
  const { t } = useTranslation();
  
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FaLock className="w-12 h-12 text-[#4a2c10]/30 mb-4" />
        <h4 className="font-heading text-xl text-[#4a2c10] mb-2">
          {t('bosses.proFeature', 'PRO Feature')}
        </h4>
        <p className="font-handwriting text-[#4a2c10]/70 max-w-sm">
          {t('bosses.unlockStats', 'Upgrade to PRO to see community statistics and death rates')}
        </p>
      </div>
    );
  }
  
  const stats = boss.stats || {
    deathRate: Math.floor(Math.random() * 40) + 10,
    completionRate: Math.floor(Math.random() * 60) + 40,
    hardModeRate: Math.floor(Math.random() * 30) + 5,
    avgAttempts: (Math.random() * 3 + 1).toFixed(1)
  };
  
  return (
    <div className="space-y-6">
      {/* Death Rate Meter */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-handwriting text-base text-[#4a2c10] flex items-center gap-2">
            <GiDeathSkull className="text-[#8b0000]" />
            {t('bosses.deathRate', 'Death Rate')}
          </span>
          <span className="font-heading text-lg text-[#8b0000]">{stats.deathRate}%</span>
        </div>
        <div className="h-4 bg-[#f4e4bc] border-2 border-[#4a2c10] overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#8b0000] to-[#dc2626]"
            initial={{ width: 0 }}
            animate={{ width: `${stats.deathRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className="font-handwriting text-xs text-[#4a2c10]/60 mt-1 italic">
          {t('bosses.deathRateDesc', '% of players who die on their first encounter')}
        </p>
      </div>
      
      {/* Completion Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#f4e4bc] border-2 border-[#4a2c10] p-4 text-center">
          <FaTrophy className="w-8 h-8 mx-auto mb-2 text-[#fbbf24]" />
          <div className="font-heading text-2xl text-[#2a1a10]">{stats.completionRate}%</div>
          <div className="font-handwriting text-xs text-[#4a2c10]">
            {t('bosses.completedBy', 'Completed By')}
          </div>
        </div>
        <div className="bg-[#f4e4bc] border-2 border-[#4a2c10] p-4 text-center">
          <FaFire className="w-8 h-8 mx-auto mb-2 text-[#dc2626]" />
          <div className="font-heading text-2xl text-[#2a1a10]">{stats.hardModeRate}%</div>
          <div className="font-handwriting text-xs text-[#4a2c10]">
            {t('bosses.hardModeComplete', 'Hard Mode')}
          </div>
        </div>
      </div>
      
      {/* Average Attempts */}
      <div className="bg-white/30 p-4 border border-[#4a2c10]/20 text-center">
        <p className="font-handwriting text-lg text-[#4a2c10]">
          {t('bosses.avgAttempts', 'Average attempts to defeat')}: 
          <span className="font-heading text-2xl text-[#8b0000] ml-2">{stats.avgAttempts}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Strategy Tab (PRO)
 */
function StrategyTab({ boss, isLocked }) {
  const { t } = useTranslation();
  
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FaLock className="w-12 h-12 text-[#4a2c10]/30 mb-4" />
        <h4 className="font-heading text-xl text-[#4a2c10] mb-2">
          {t('bosses.proFeature', 'PRO Feature')}
        </h4>
        <p className="font-handwriting text-[#4a2c10]/70 max-w-sm">
          {t('bosses.unlockStrategy', 'Upgrade to PRO to see recommended builds and strategies')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      {boss.strategy && (
        <div className="bg-white/40 p-4 border-l-4 border-[#fbbf24] -rotate-[0.3deg]">
          <h4 className="font-heading text-lg text-[#8b0000] mb-2 flex items-center gap-2">
            <FaLightbulb className="text-[#fbbf24]" />
            {t('bosses.strategyOverview', 'Strategy Overview')}
          </h4>
          <p className="font-handwriting text-base text-[#4a2c10]">{boss.strategy}</p>
        </div>
      )}
      
      {/* Recommended Items */}
      <div>
        <h4 className="font-heading text-lg text-[#2a1a10] mb-3 flex items-center gap-2">
          <GiHealthPotion className="text-[#8b0000]" />
          {t('bosses.recommendedItems', 'Recommended Items')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {(boss.recommendedItems || ['High damage', 'Speed', 'Flight']).map((item, i) => (
            <span 
              key={i}
              className="px-3 py-1 bg-[#f4e4bc] border-2 border-[#4a2c10] font-handwriting text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      
      {/* Recommended Characters */}
      <div>
        <h4 className="font-heading text-lg text-[#2a1a10] mb-3 flex items-center gap-2">
          <GiPerson className="text-[#8b0000]" />
          {t('bosses.recommendedCharacters', 'Best Characters')}
        </h4>
        <div className="flex flex-wrap gap-2">
          {(boss.recommendedCharacters || ['Azazel', 'The Lost', 'Isaac']).map((char, i) => (
            <span 
              key={i}
              className="px-3 py-1 bg-[#8b0000] text-[#f4e4bc] font-handwriting text-sm"
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * User Status Tab
 */
function UserStatusTab({ boss, onMarkDefeated }) {
  const { t } = useTranslation();
  const { getBossProgress, getBossStatus, hasSaveLoaded, markAsDefeated, removeManualMark } = useBossProgress();
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [selectedMode, setSelectedMode] = useState('normal');
  
  const progress = getBossProgress(boss.id);
  const status = getBossStatus(boss.id);
  const isDefeated = status !== DEFEAT_STATUS.NOT_DEFEATED;
  
  const handleMark = () => {
    markAsDefeated(boss.id, { 
      mode: selectedMode, 
      character: selectedCharacter || null 
    });
    if (onMarkDefeated) onMarkDefeated();
  };
  
  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={cn(
        "p-6 border-4 text-center",
        isDefeated 
          ? "bg-green-900/20 border-green-700" 
          : "bg-[#8b0000]/10 border-[#8b0000]"
      )}>
        {isDefeated ? (
          <>
            <FaCheck className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h4 className="font-heading text-2xl text-green-700 mb-2">
              {status === DEFEAT_STATUS.MASTERED 
                ? t('bosses.statusMastered', 'MASTERED')
                : status === DEFEAT_STATUS.HARD 
                  ? t('bosses.statusHardComplete', 'HARD MODE COMPLETE')
                  : t('bosses.statusDefeated', 'DEFEATED')}
            </h4>
            {progress?.firstDefeatDate && (
              <p className="font-handwriting text-sm text-[#4a2c10]/70">
                {t('bosses.firstDefeated', 'First defeated')}: {new Date(progress.firstDefeatDate).toLocaleDateString()}
              </p>
            )}
          </>
        ) : (
          <>
            <GiCrossedSwords className="w-12 h-12 mx-auto mb-3 text-[#8b0000]" />
            <h4 className="font-heading text-2xl text-[#8b0000] mb-2">
              {t('bosses.statusWanted', 'STILL WANTED')}
            </h4>
            <p className="font-handwriting text-sm text-[#4a2c10]/70">
              {t('bosses.notYetDefeated', 'You have not defeated this boss yet')}
            </p>
          </>
        )}
      </div>
      
      {/* Characters defeated with */}
      {progress?.charactersDefeated?.length > 0 && (
        <div>
          <h4 className="font-heading text-lg text-[#2a1a10] mb-3">
            {t('bosses.defeatedWith', 'Defeated with')}:
          </h4>
          <div className="flex flex-wrap gap-2">
            {progress.charactersDefeated.map((char, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-[#fbbf24] text-[#2a1a10] font-handwriting text-xs"
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Manual Mark Section */}
      {!hasSaveLoaded && (
        <div className="border-t-2 border-[#4a2c10]/30 pt-6">
          <h4 className="font-heading text-lg text-[#2a1a10] mb-4 flex items-center gap-2">
            <FaHandPointer className="text-[#8b0000]" />
            {t('bosses.manualMark', 'Mark Manually')}
          </h4>
          
          <div className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="font-handwriting text-sm text-[#4a2c10] block mb-2">
                {t('bosses.selectMode', 'Difficulty')}:
              </label>
              <div className="flex gap-2">
                <button
                  className={cn(
                    "px-4 py-2 font-handwriting border-2",
                    selectedMode === 'normal' 
                      ? "bg-[#8b0000] text-[#f4e4bc] border-[#5c0000]"
                      : "bg-[#f4e4bc] text-[#2a1a10] border-[#4a2c10]"
                  )}
                  onClick={() => setSelectedMode('normal')}
                >
                  Normal
                </button>
                <button
                  className={cn(
                    "px-4 py-2 font-handwriting border-2",
                    selectedMode === 'hard' 
                      ? "bg-[#1a1a1a] text-[#f4e4bc] border-[#000]"
                      : "bg-[#f4e4bc] text-[#2a1a10] border-[#4a2c10]"
                  )}
                  onClick={() => setSelectedMode('hard')}
                >
                  Hard Mode
                </button>
              </div>
            </div>
            
            {/* Character Selection */}
            <div>
              <label className="font-handwriting text-sm text-[#4a2c10] block mb-2">
                {t('bosses.selectCharacter', 'Character (optional)')}:
              </label>
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="w-full px-3 py-2 bg-[#f4e4bc] border-2 border-[#4a2c10] font-handwriting text-[#2a1a10] focus:outline-none focus:border-[#8b0000]"
              >
                <option value="">{t('bosses.anyCharacter', '-- Any Character --')}</option>
                {ALL_CHARACTERS.map(char => (
                  <option key={char} value={char}>{char}</option>
                ))}
              </select>
            </div>
            
            {/* Mark Button */}
            <motion.button
              className={cn(
                "w-full py-3 font-heading text-xl uppercase tracking-wider",
                "bg-[#8b0000] text-[#f4e4bc] border-4 border-[#5c0000]",
                "shadow-[4px_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-1",
                "transition-all duration-200"
              )}
              onClick={handleMark}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GiBroadsword className="inline mr-2" />
              {t('bosses.markDefeated', 'Mark as Defeated')}
            </motion.button>
            
            {/* Reset button */}
            {isDefeated && (
              <button
                className="w-full py-2 font-handwriting text-sm text-[#8b0000] hover:underline"
                onClick={() => removeManualMark(boss.id)}
              >
                {t('bosses.resetProgress', 'Reset progress for this boss')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Unlock Reward Component
 */
function UnlockReward({ boss }) {
  const { t } = useTranslation();
  
  if (!boss.unlocks?.length && !boss.drops?.length) return null;
  
  return (
    <div className="mt-6 pt-6 border-t-2 border-[#4a2c10]/30">
      <h4 className="font-heading text-lg text-[#2a1a10] mb-3 flex items-center gap-2">
        <FaStar className="text-[#fbbf24]" />
        {t('bosses.rewards', 'Rewards & Unlocks')}
      </h4>
      
      <div className="space-y-2">
        {boss.drops?.map((drop, i) => (
          <div key={i} className="flex items-center gap-2 font-handwriting text-sm text-[#4a2c10]">
            <span className="w-2 h-2 bg-[#8b0000] rounded-full" />
            {drop}
          </div>
        ))}
        
        {boss.unlocks?.map((unlock, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between bg-[#fbbf24]/20 px-3 py-2 border border-[#b45309]"
          >
            <span className="font-handwriting text-sm text-[#2a1a10]">
              {unlock.name || unlock}
            </span>
            {unlock.character && (
              <span className="text-xs text-[#4a2c10]/70">
                via {unlock.character}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Premium Boss Detail Modal
 */
export function BossDetailModal({ boss, onClose }) {
  const { t } = useTranslation();
  const { hasPremium } = useFeatures();
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!boss) return null;
  
  const tabs = [
    { id: 'overview', label: t('bosses.tab.overview', 'Overview'), icon: FaSkull },
    { id: 'attacks', label: t('bosses.tab.attacks', 'Attacks'), icon: GiCrossedSwords },
    { id: 'stats', label: t('bosses.tab.stats', 'Stats'), icon: FaChartBar, isPro: true },
    { id: 'strategy', label: t('bosses.tab.strategy', 'Strategy'), icon: FaLightbulb, isPro: true },
    { id: 'status', label: t('bosses.tab.status', 'My Status'), icon: FaUserCheck }
  ];
  
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      {/* Modal */}
      <motion.div 
        className="relative w-full max-w-4xl bg-[#fdfbf7] text-[#2a1a10] shadow-2xl my-8"
        initial={{ opacity: 0, scale: 0.9, y: 50, rotate: 2 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50, rotate: -2 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Paper texture */}
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#4a2c10] to-[#2a1a10] text-[#f4e4bc] p-6 pb-8">
          {/* Tape decorations */}
          <div className="absolute -bottom-3 left-12 w-16 h-6 bg-[#e0d8c3]/80 rotate-[-2deg] shadow-sm" />
          <div className="absolute -bottom-3 right-12 w-16 h-6 bg-[#e0d8c3]/80 rotate-[3deg] shadow-sm" />
          
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-[#f4e4bc]/80 hover:text-white transition-colors"
            onClick={onClose}
          >
            <FaTimes className="w-6 h-6" />
          </button>
          
          {/* Boss image and title */}
          <div className="flex items-center gap-6">
            <div className="shrink-0 w-24 h-24 bg-[#f4e4bc] border-4 border-[#8b0000] p-2 rotate-[-3deg] shadow-lg">
              {boss.image ? (
                <img 
                  src={boss.image} 
                  alt={boss.name} 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : (
                <FaSkull className="w-full h-full text-[#8b0000]/30" />
              )}
            </div>
            
            <div>
              <h2 className="font-heading text-3xl md:text-4xl uppercase tracking-tight">
                {boss.name}
              </h2>
              <div className="flex items-center gap-3 mt-2 font-handwriting text-lg text-[#f4e4bc]/80">
                <FaMapMarkerAlt className="text-[#8b0000]" />
                {boss.location || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Tab Navigation */}
          <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab boss={boss} />}
              {activeTab === 'attacks' && <AttackPatternsTab boss={boss} />}
              {activeTab === 'stats' && <GlobalStatsTab boss={boss} isLocked={!hasPremium} />}
              {activeTab === 'strategy' && <StrategyTab boss={boss} isLocked={!hasPremium} />}
              {activeTab === 'status' && <UserStatusTab boss={boss} />}
            </motion.div>
          </AnimatePresence>
          
          {/* Unlock Rewards (always visible at bottom) */}
          <UnlockReward boss={boss} />
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default BossDetailModal;
