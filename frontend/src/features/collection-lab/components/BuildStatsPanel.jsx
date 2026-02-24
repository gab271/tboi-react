/**
 * BuildStatsPanel - Panel de estadísticas de la build
 * Muestra DPS, daño, fire rate, transformaciones, etc.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronUp, 
  FaChevronDown, 
  FaFire, 
  FaBolt, 
  FaSkull,
  FaMagic,
  FaWind,
  FaDice,
  FaFeather
} from 'react-icons/fa';
import { cn } from '../../../lib/utils';
import { TRANSFORMATION_INFO } from '../lib/effectCalculator';

export function BuildStatsPanel({ metrics }) {
  const [expanded, setExpanded] = useState(true);
  
  if (!metrics) return null;
  
  return (
    <>
      {/* Desktop: Fixed Panel */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-40 w-72"
      >
        <div className="bg-black/95 border-2 border-accent-gold rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.2)]">
          <StatsContent metrics={metrics} expanded={true} />
        </div>
      </motion.div>
      
      {/* Mobile: Bottom Drawer */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      >
        <div className="bg-black/95 border-t-2 border-accent-gold rounded-t-2xl overflow-hidden">
          {/* Drag Handle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-3 flex items-center justify-center gap-2 text-accent-gold"
          >
            <span className="w-12 h-1 bg-accent-gold/50 rounded-full" />
            {expanded ? <FaChevronDown /> : <FaChevronUp />}
          </button>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <StatsContent metrics={metrics} expanded={expanded} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Collapsed Preview */}
          {!expanded && (
            <div className="px-4 pb-4 flex items-center justify-around">
              <StatMini icon={<FaSkull />} label="DPS" value={metrics.dps} color="text-red-400" />
              <StatMini icon={<FaFire />} label="DMG" value={metrics.damage} color="text-orange-400" />
              <StatMini icon={<FaBolt />} label="RATE" value={metrics.tearsPerSecond} color="text-blue-400" />
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// Stats Content (shared between desktop and mobile)
function StatsContent({ metrics }) {
  const rating = metrics.rating;
  
  return (
    <div className="p-4 space-y-4">
      
      {/* Rating Badge */}
      <div className="text-center pb-3 border-b border-white/10">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-2xl"
          style={{ 
            backgroundColor: `${rating.color}20`,
            color: rating.color,
            boxShadow: `0 0 20px ${rating.color}40`
          }}
        >
          <span className="text-4xl font-bold">{rating.tier}</span>
          <div className="text-left">
            <div className="text-sm font-bold">{rating.label}</div>
            <div className="text-xs opacity-70">{rating.confidence}% confidence</div>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2 font-handwriting">
          {rating.description}
        </p>
      </div>
      
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={<FaSkull />} 
          label="DPS" 
          value={metrics.dps}
          color="red"
          large
        />
        <StatCard 
          icon={<FaFire />} 
          label="Damage" 
          value={metrics.damage}
          subtext={`×${metrics.damageMultiplier}`}
          color="orange"
        />
        <StatCard 
          icon={<FaBolt />} 
          label="Fire Rate" 
          value={`${metrics.tearsPerSecond}/s`}
          subtext={`×${metrics.tearCount} tears`}
          color="blue"
        />
        <StatCard 
          icon={<FaMagic />} 
          label="Tear Type" 
          value={formatTearType(metrics.tearType)}
          color="purple"
        />
      </div>
      
      {/* Tear Flags */}
      {metrics.tearFlags && metrics.tearFlags.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Active Effects</h4>
          <div className="flex flex-wrap gap-1">
            {metrics.tearFlags.map((flag, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded font-mono"
              >
                {formatFlag(flag)}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Transformations */}
      {metrics.transformationProgress && metrics.transformationProgress.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Transformations</h4>
          <div className="space-y-2">
            {metrics.transformationProgress.map((tp) => (
              <TransformationProgress key={tp.tag} progress={tp} />
            ))}
          </div>
        </div>
      )}
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
        <MiniStat icon={<FaWind />} label="Speed" value={metrics.speed} />
        <MiniStat icon={<FaFeather />} label="Range" value={metrics.range} />
        <MiniStat icon={<FaDice />} label="Luck" value={metrics.luck} />
      </div>
      
      {/* Special Flags */}
      {metrics.canFly && (
        <div className="flex items-center justify-center gap-2 py-2 bg-blue-900/30 rounded text-blue-300">
          <FaFeather />
          <span className="text-sm font-bold">Flight Active</span>
        </div>
      )}
      
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, subtext, color, large }) {
  const colors = {
    red: 'from-red-900/50 to-red-950/50 border-red-700/50 text-red-400',
    orange: 'from-orange-900/50 to-orange-950/50 border-orange-700/50 text-orange-400',
    blue: 'from-blue-900/50 to-blue-950/50 border-blue-700/50 text-blue-400',
    purple: 'from-purple-900/50 to-purple-950/50 border-purple-700/50 text-purple-400',
    green: 'from-green-900/50 to-green-950/50 border-green-700/50 text-green-400',
  };
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border p-3",
      "bg-gradient-to-br",
      colors[color],
      large && "col-span-2"
    )}>
      <div className="flex items-start gap-2">
        <span className="text-lg opacity-70">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider opacity-60 mb-1">{label}</div>
          <div className={cn(
            "font-heading font-bold truncate",
            large ? "text-3xl" : "text-xl"
          )}>
            {value}
          </div>
          {subtext && (
            <div className="text-xs opacity-50 mt-0.5">{subtext}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mini Stat for collapsed view
function StatMini({ icon, label, value, color }) {
  return (
    <div className={cn("flex items-center gap-2", color)}>
      {icon}
      <div>
        <div className="text-[10px] uppercase opacity-60">{label}</div>
        <div className="font-heading font-bold">{value}</div>
      </div>
    </div>
  );
}

// Mini Stat in footer
function MiniStat({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="text-gray-500 mb-1">{icon}</div>
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-gray-600 text-[10px] uppercase">{label}</div>
    </div>
  );
}

// Transformation Progress
function TransformationProgress({ progress }) {
  const info = TRANSFORMATION_INFO[progress.tag] || { name: progress.tag, icon: '❓', color: '#666' };
  const percent = (progress.current / progress.threshold) * 100;
  
  return (
    <div className={cn(
      "p-2 rounded-lg border transition-all",
      progress.complete 
        ? "bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border-yellow-600/50"
        : "bg-black/30 border-white/10"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{info.icon}</span>
        <span className={cn(
          "font-heading text-sm uppercase tracking-wider",
          progress.complete ? "text-yellow-400" : "text-gray-400"
        )}>
          {info.name}
        </span>
        <span className="ml-auto text-xs font-mono text-gray-500">
          {progress.current}/{progress.threshold}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          className={cn(
            "h-full rounded-full transition-all",
            progress.complete 
              ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
              : "bg-gray-600"
          )}
          style={progress.complete ? { boxShadow: '0 0 10px rgba(255,215,0,0.5)' } : {}}
        />
      </div>
      
      {progress.complete && (
        <p className="text-xs text-yellow-400/70 mt-1 font-handwriting">
          {info.description}
        </p>
      )}
    </div>
  );
}

// Helpers
function formatTearType(type) {
  const types = {
    normal: 'Normal',
    brimstone: 'Brimstone',
    laser: 'Laser',
    knife: 'Knife',
    techx: 'Tech X',
    ludovico: 'Ludovico',
    epic: 'Epic Fetus',
    dr_fetus: 'Dr. Fetus',
    spirit: 'Spirit',
    mini_brimstone: 'Mini Brim',
    fetus: 'C-Section',
  };
  return types[type] || type;
}

function formatFlag(flag) {
  const flags = {
    piercing: '⚔️ Pierce',
    spectral: '👻 Spectral',
    homing: '🎯 Homing',
    explosive: '💥 Explosive',
    poison: '☠️ Poison',
    split: '💫 Split',
    orbit: '🌀 Orbit',
    boomerang: '🪃 Boomerang',
    shield: '🛡️ Block',
    holy: '✨ Holy',
    controllable: '🎮 Control',
  };
  return flags[flag] || flag;
}
