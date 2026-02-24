/**
 * ItemHoverCard - Tarjeta flotante premium
 * Aparece al hacer hover sobre un item, carga instantáneamente
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaFire, FaBolt, FaMagic, FaLink, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useBuildLab } from '../hooks/useBuildLab';
import { cn } from '../../../lib/utils';
import { classifyItem } from '../lib/filterEngine';

export function ItemHoverCard({ item, position, itemStatus }) {
  const { selectedItems, getItemImpact } = useBuildLab();
  
  // Calcular impacto si hay items en el build lab
  const impact = useMemo(() => {
    if (selectedItems.length === 0) return null;
    return getItemImpact(item);
  }, [item, selectedItems, getItemImpact]);
  
  // Clasificar item según filtros inteligentes
  const tags = useMemo(() => classifyItem(item), [item]);
  
  // Ajustar posición para que no se salga de la pantalla
  const adjustedPosition = useMemo(() => {
    const cardWidth = 320;
    const cardHeight = 400;
    const padding = 10;
    
    let x = position.x;
    let y = position.y;
    
    // Ajustar horizontal
    if (x + cardWidth > window.innerWidth - padding) {
      x = position.x - cardWidth - 20; // Mostrar a la izquierda
    }
    
    // Ajustar vertical
    if (y + cardHeight > window.innerHeight - padding) {
      y = window.innerHeight - cardHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  }, [position]);
  
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[100] pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: 320,
      }}
    >
      <div className="bg-[#1a1a1a] border-2 border-[#404040] rounded-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-white/10",
          item.quality === 4 && "bg-gradient-to-r from-yellow-900/30 to-transparent",
          item.quality === 3 && "bg-gradient-to-r from-purple-900/30 to-transparent",
        )}>
          <div className="flex items-start gap-3">
            {/* Small Image */}
            <div className="w-12 h-12 bg-black/50 rounded flex items-center justify-center flex-shrink-0">
              {(item.image || item.sprite_url) && (
                <img 
                  src={item.image || item.sprite_url} 
                  alt={item.name}
                  className="max-w-full max-h-full object-contain pixelated"
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-heading text-lg leading-tight",
                item.quality === 4 ? "text-accent-gold" : "text-white"
              )}>
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded font-bold uppercase",
                  item.item_type === 'active' && "bg-blue-900 text-blue-300",
                  item.item_type === 'passive' && "bg-green-900 text-green-300",
                  item.item_type === 'trinket' && "bg-purple-900 text-purple-300",
                )}>
                  {item.item_type || 'passive'}
                </span>
                {item.quality !== undefined && (
                  <span className="text-xs text-gray-400">
                    Quality {item.quality}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Pickup Quote */}
          {item.pickup_quote && (
            <p className="mt-2 text-sm italic text-accent-gold/70 font-handwriting">
              "{item.pickup_quote}"
            </p>
          )}
        </div>
        
        {/* Description */}
        {item.description && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm text-gray-300">{item.description}</p>
          </div>
        )}
        
        {/* Effects Preview */}
        {item.effects && (
          <div className="px-4 py-3 border-b border-white/10 space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-gray-500">Effects</h4>
            <div className="flex flex-wrap gap-2">
              {item.effects.flatDamage && (
                <EffectBadge icon={<FaFire />} label={`+${item.effects.flatDamage} DMG`} color="red" />
              )}
              {item.effects.damageMultiplier && item.effects.damageMultiplier !== 1 && (
                <EffectBadge 
                  icon={<FaFire />} 
                  label={`×${item.effects.damageMultiplier} DMG`} 
                  color={item.effects.damageMultiplier > 1 ? "orange" : "gray"} 
                />
              )}
              {item.effects.tearType && (
                <EffectBadge icon={<FaMagic />} label={item.effects.tearType} color="purple" />
              )}
              {item.effects.tearFlags?.map((flag, i) => (
                <EffectBadge key={i} icon={<FaBolt />} label={flag} color="blue" />
              ))}
            </div>
          </div>
        )}
        
        {/* Build Impact (si hay items en el lab) */}
        {impact && (
          <div className="px-4 py-3 bg-black/30 border-b border-white/10">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Impact on your build
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ImpactMetric 
                label="DPS"
                value={impact.dps.delta}
                percent={impact.dps.percent}
              />
              <ImpactMetric 
                label="Damage"
                value={impact.damage.delta}
                percent={impact.damage.percent}
              />
            </div>
            {impact.newFlags.length > 0 && (
              <div className="mt-2 text-xs text-green-400">
                + New effects: {impact.newFlags.join(', ')}
              </div>
            )}
            {impact.tearType.changed && (
              <div className="mt-1 text-xs text-purple-400">
                → Tear type: {impact.tearType.after}
              </div>
            )}
          </div>
        )}
        
        {/* Smart Tags */}
        {tags.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 5).map((tag) => (
                <span 
                  key={tag.id}
                  className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded"
                >
                  {tag.icon} {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Transformations */}
        {item.transformationTags && item.transformationTags.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10">
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
              <FaLink className="text-yellow-500" /> Transformations
            </h4>
            <div className="flex flex-wrap gap-1">
              {item.transformationTags.map((tag) => (
                <span 
                  key={tag}
                  className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* User Progress */}
        {itemStatus && !itemStatus.isLocked && itemStatus.usageCount > 0 && (
          <div className="px-4 py-2 bg-purple-900/20 text-purple-300 text-xs">
            You've used this item {itemStatus.usageCount} times
          </div>
        )}
        
        {/* Action Hint */}
        <div className="px-4 py-2 bg-black/50 text-center">
          <span className="text-xs text-gray-500">
            Click to add • Right-click for details
          </span>
        </div>
        
      </div>
    </motion.div>
  );
  
  return createPortal(content, document.body);
}

// Effect Badge Component
function EffectBadge({ icon, label, color }) {
  const colors = {
    red: 'bg-red-900/50 text-red-300 border-red-700/50',
    orange: 'bg-orange-900/50 text-orange-300 border-orange-700/50',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
    purple: 'bg-purple-900/50 text-purple-300 border-purple-700/50',
    green: 'bg-green-900/50 text-green-300 border-green-700/50',
    gray: 'bg-gray-800/50 text-gray-400 border-gray-700/50',
  };
  
  return (
    <span className={cn(
      "flex items-center gap-1 text-xs px-2 py-1 rounded border",
      colors[color]
    )}>
      {icon}
      <span className="font-mono">{label}</span>
    </span>
  );
}

// Impact Metric Component
function ImpactMetric({ label, value, percent }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <div className={cn(
      "p-2 rounded text-center",
      isPositive && "bg-green-900/30",
      isNegative && "bg-red-900/30",
      !isPositive && !isNegative && "bg-gray-900/30"
    )}>
      <div className="text-xs text-gray-400 uppercase">{label}</div>
      <div className={cn(
        "font-heading text-lg flex items-center justify-center gap-1",
        isPositive && "text-green-400",
        isNegative && "text-red-400",
        !isPositive && !isNegative && "text-gray-400"
      )}>
        {isPositive && <FaArrowUp className="text-xs" />}
        {isNegative && <FaArrowDown className="text-xs" />}
        {value > 0 ? '+' : ''}{typeof value === 'number' ? value.toFixed(1) : value}
      </div>
      {percent !== 0 && (
        <div className="text-xs text-gray-500">
          ({percent > 0 ? '+' : ''}{percent.toFixed(0)}%)
        </div>
      )}
    </div>
  );
}
