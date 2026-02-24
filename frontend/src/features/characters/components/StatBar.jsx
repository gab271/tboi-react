/**
 * StatBar - Barra de stat estilo pixel para mostrar estadísticas base
 */
import { cn } from '../../../lib/utils';
import { STAT_RANGES } from '../data/characterStats';

/**
 * Calcula el porcentaje de una stat dentro de su rango
 */
function calculatePercentage(value, min, max) {
  if (value === null) return 50; // Random/Eden
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(100, normalized * 100));
}

/**
 * Formatea el valor para mostrar
 */
function formatValue(statKey, value) {
  if (value === null) return '???';
  
  if (statKey === 'tears' || statKey === 'luck') {
    return value > 0 ? `+${value}` : value.toString();
  }
  
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return value.toFixed(2);
  }
  
  return value.toString();
}

/**
 * Determina el color de la barra según el valor
 */
function getBarColor(percentage, statKey) {
  // Para tears, menor es mejor (reversed)
  const adjustedPercentage = statKey === 'tears' ? 100 - percentage : percentage;
  
  if (adjustedPercentage >= 70) return 'bg-green-500';
  if (adjustedPercentage >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function StatBar({ 
  statKey, 
  value, 
  showTooltip = true,
  className 
}) {
  const config = STAT_RANGES[statKey];
  if (!config) return null;
  
  const percentage = calculatePercentage(value, config.min, config.max);
  const isRandom = value === null;
  const displayValue = formatValue(statKey, value);
  const barColor = getBarColor(percentage, statKey);
  
  return (
    <div 
      className={cn("group relative", className)}
      title={showTooltip ? config.tooltip : undefined}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        <span className="text-sm w-5 text-center flex-shrink-0">{config.icon}</span>
        
        {/* Label */}
        <span className="text-xs font-medium text-text-dim w-16 flex-shrink-0">
          {config.label}
        </span>
        
        {/* Bar container */}
        <div className="flex-1 h-3 bg-bg-paper-dark/50 rounded-sm overflow-hidden border border-text-ink/10">
          {isRandom ? (
            <div className="h-full w-full bg-gradient-to-r from-purple-500/50 via-purple-400/30 to-purple-500/50 animate-pulse" />
          ) : (
            <div 
              className={cn("h-full transition-all duration-300", barColor)}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
        
        {/* Value */}
        <span className={cn(
          "text-xs font-mono w-10 text-right flex-shrink-0",
          isRandom && "text-purple-500 animate-pulse"
        )}>
          {displayValue}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute left-0 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-dim pointer-events-none">
          {config.tooltip}
        </div>
      )}
    </div>
  );
}

/**
 * StatsPanel - Panel completo con todas las stats
 */
export function StatsPanel({ stats, isEden = false, showHeader = false, className }) {
  const statKeys = ['damage', 'tears', 'speed', 'range', 'shotSpeed', 'luck'];
  
  // Si es Eden, las stats son random (null)
  const displayStats = isEden 
    ? statKeys.reduce((acc, key) => ({ ...acc, [key]: null }), {})
    : stats;
  
  return (
    <div className={cn("space-y-2", className)}>
      {showHeader && (
        <h3 className="font-heading text-xs mb-3 text-text-dim uppercase tracking-wider">
          Base Stats
        </h3>
      )}
      <div className="space-y-1.5">
        {statKeys.map(key => (
          <StatBar 
            key={key} 
            statKey={key} 
            value={displayStats?.[key]} 
          />
        ))}
      </div>
    </div>
  );
}
