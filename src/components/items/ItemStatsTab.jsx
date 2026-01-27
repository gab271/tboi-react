import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeart, 
  FaTint, 
  FaRunning, 
  FaStar, 
  FaRuler, 
  FaCrosshairs,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa';
import { GiLightningTear } from 'react-icons/gi';

// Mapeo de iconos para stats
const STAT_ICONS = {
  damage: { icon: FaHeart, label: 'Damage', color: '#dc2626' },
  damageMultiplier: { icon: FaCrosshairs, label: 'Damage x', color: '#dc2626' },
  tears: { icon: FaTint, label: 'Tears', color: '#3b82f6' },
  tearDelay: { icon: GiLightningTear, label: 'Fire Rate', color: '#8b5cf6' },
  tearDelayMultiplier: { icon: FaBolt, label: 'Fire Rate x', color: '#8b5cf6' },
  speed: { icon: FaRunning, label: 'Speed', color: '#f59e0b' },
  range: { icon: FaRuler, label: 'Range', color: '#10b981' },
  shotSpeed: { icon: FaBolt, label: 'Shot Speed', color: '#06b6d4' },
  luck: { icon: FaStar, label: 'Luck', color: '#22c55e' },
  health: { icon: FaHeart, label: 'Red Hearts', color: '#ef4444' },
  soulHearts: { icon: FaShieldAlt, label: 'Soul Hearts', color: '#60a5fa' },
  blackHearts: { icon: FaShieldAlt, label: 'Black Hearts', color: '#1e293b' },
};

const StatCard = ({ statKey, value }) => {
  const config = STAT_ICONS[statKey];
  if (!config) return null;
  
  const Icon = config.icon;
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const isMultiplier = statKey.includes('Multiplier');
  
  // Colores basados en si es positivo/negativo
  const valueColor = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : isNegative 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-gray-600 dark:text-gray-400';
  
  const bgColor = isPositive 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
    : isNegative 
      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${bgColor} transition-all hover:shadow-md`}
    >
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-full"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="text-xl" style={{ color: config.color }} />
      </div>
      
      <div className="flex-1">
        <div className="text-sm font-pixel uppercase tracking-widest text-text-dim mb-0.5">
          {config.label}
        </div>
        <div className={`text-3xl font-pixel ${valueColor}`}>
          {isPositive && '+'}
          {isMultiplier ? `×${numericValue}` : numericValue}
        </div>
      </div>
    </motion.div>
  );
};

export function ItemStatsTab({ stats }) {
  if (!stats || Object.keys(stats).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-[#d3c6aa]/20 flex items-center justify-center">
          <FaHeart className="text-5xl text-[#bdae93]" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-text-heading mb-2">
          No Stat Changes
        </h3>
        <p className="text-lg font-handwriting text-text-dim max-w-md">
          This item provides utility or special effects without modifying Isaac's base statistics.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FaBolt className="text-accent-gold text-2xl" />
        <h3 className="text-2xl font-heading font-bold text-text-heading">
          Stat Modifications
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <StatCard key={key} statKey={key} value={value} />
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-[#e6ddc5]/30 rounded-lg border border-[#bdae93]">
        <p className="text-sm font-handwriting text-text-dim">
          <strong>Note:</strong> Multipliers apply after flat bonuses. Negative tear delay values increase fire rate.
        </p>
      </div>
    </div>
  );
}
