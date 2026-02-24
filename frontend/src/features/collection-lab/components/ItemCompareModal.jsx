/**
 * ItemCompareModal - Modal de comparación de dos items
 * Muestra impacto visual lado a lado con indicadores
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FaTimes, FaChevronRight, FaTrophy, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { useBuildLab } from '../hooks/useBuildLab';
import { compareItems } from '../lib/effectCalculator';
import { cn } from '../../../lib/utils';

export function ItemCompareModal({ itemA, itemB, onClose }) {
  const { selectedItems } = useBuildLab();
  
  // Calcular comparación
  const comparison = useMemo(() => {
    return compareItems(itemA, itemB, selectedItems);
  }, [itemA, itemB, selectedItems]);
  
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#1a1a1a] rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl text-white flex items-center gap-2">
              <FaTrophy className="text-accent-gold" />
              Item Comparison
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          {/* Winner Banner */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <WinnerIndicator 
              winner={comparison.winner === 'A'} 
              label="A"
            />
            <div className="text-center">
              <p className="text-gray-400 text-sm">DPS Difference</p>
              <p className="font-heading text-2xl text-accent-gold">
                +{comparison.dpsDifference.toFixed(0)}
              </p>
            </div>
            <WinnerIndicator 
              winner={comparison.winner === 'B'} 
              label="B"
            />
          </div>
        </div>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-3 gap-0 divide-x divide-white/10">
          
          {/* Item A Column */}
          <CompareColumn 
            item={comparison.itemA} 
            label="A"
            isWinner={comparison.winner === 'A'}
          />
          
          {/* VS Divider / Metrics */}
          <div className="bg-black/50 p-6">
            <div className="text-center mb-6">
              <span className="font-heading text-4xl text-gray-600">VS</span>
            </div>
            
            <div className="space-y-4">
              <MetricRow 
                label="DPS Impact"
                valueA={comparison.itemA.impact.dps}
                valueB={comparison.itemB.impact.dps}
              />
              <MetricRow 
                label="Damage"
                valueA={comparison.itemA.impact.damage}
                valueB={comparison.itemB.impact.damage}
              />
              <MetricRow 
                label="Fire Rate"
                valueA={comparison.itemA.impact.tearsPerSecond}
                valueB={comparison.itemB.impact.tearsPerSecond}
              />
            </div>
            
            {/* Transformation Progress */}
            {(comparison.itemA.impact.transformations.length > 0 || 
              comparison.itemB.impact.transformations.length > 0) && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 text-center">
                  Transformation Progress
                </h4>
                <div className="space-y-2">
                  <TransformCompare 
                    transformsA={comparison.itemA.impact.transformations}
                    transformsB={comparison.itemB.impact.transformations}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Item B Column */}
          <CompareColumn 
            item={comparison.itemB} 
            label="B"
            isWinner={comparison.winner === 'B'}
          />
          
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-black/30 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            Comparison based on your current build of {selectedItems.length} items
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
  
  return createPortal(content, document.body);
}

// Compare Column Component
function CompareColumn({ item, label, isWinner }) {
  const imageUrl = item.image || item.sprite_url;
  
  return (
    <div className={cn(
      "p-6 transition-all",
      isWinner && "bg-gradient-to-b from-green-900/20 to-transparent"
    )}>
      {/* Winner Badge */}
      {isWinner && (
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <FaTrophy /> WINNER
          </span>
        </div>
      )}
      
      {/* Item Display */}
      <div className="text-center mb-6">
        <div className={cn(
          "w-24 h-24 mx-auto bg-black/50 rounded-lg flex items-center justify-center mb-3",
          "border-2",
          isWinner ? "border-green-500" : "border-gray-700"
        )}>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={item.name}
              className="max-w-full max-h-full object-contain pixelated"
            />
          )}
        </div>
        <h3 className={cn(
          "font-heading text-lg",
          item.quality === 4 ? "text-accent-gold" : "text-white"
        )}>
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm capitalize">{item.item_type || 'passive'}</p>
      </div>
      
      {/* Stats */}
      <div className="space-y-3">
        <StatRow 
          label="Final DPS" 
          value={item.fullState?.finalDPS?.toFixed(0) || 0}
          highlight={isWinner}
        />
        <StatRow 
          label="Damage" 
          value={item.fullState?.finalDamage?.toFixed(2) || 0}
        />
        <StatRow 
          label="Tears/s" 
          value={item.fullState?.tearsPerSecond?.toFixed(2) || 0}
        />
        <StatRow 
          label="Tear Type" 
          value={item.fullState?.tearType || 'normal'}
        />
      </div>
      
      {/* Rating */}
      {item.fullState?.rating && (
        <div className="mt-4 text-center">
          <span 
            className="inline-block px-4 py-2 rounded font-heading text-2xl font-bold"
            style={{ 
              backgroundColor: `${item.fullState.rating.color}20`,
              color: item.fullState.rating.color 
            }}
          >
            {item.fullState.rating.tier}
          </span>
          <p className="text-xs text-gray-500 mt-1">{item.fullState.rating.label}</p>
        </div>
      )}
    </div>
  );
}

// Winner Indicator
function WinnerIndicator({ winner, label }) {
  return (
    <div className={cn(
      "w-16 h-16 rounded-full flex items-center justify-center font-heading text-2xl transition-all",
      winner 
        ? "bg-green-600 text-white ring-4 ring-green-500/50" 
        : "bg-gray-800 text-gray-500"
    )}>
      {label}
    </div>
  );
}

// Stat Row
function StatRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={cn(
        "font-mono font-bold",
        highlight ? "text-green-400" : "text-white"
      )}>
        {value}
      </span>
    </div>
  );
}

// Metric Comparison Row
function MetricRow({ label, valueA, valueB }) {
  const diff = valueA - valueB;
  const aWins = diff > 0;
  const bWins = diff < 0;
  const tie = diff === 0;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {/* A indicator */}
      <div className={cn(
        "w-6 h-6 rounded flex items-center justify-center",
        aWins && "bg-green-600 text-white",
        !aWins && "bg-gray-800 text-gray-500"
      )}>
        {aWins ? <FaArrowUp className="text-xs" /> : tie ? <FaEquals className="text-xs" /> : <FaArrowDown className="text-xs" />}
      </div>
      
      <span className="flex-1 text-center text-gray-400 text-xs uppercase tracking-wider">
        {label}
      </span>
      
      {/* B indicator */}
      <div className={cn(
        "w-6 h-6 rounded flex items-center justify-center",
        bWins && "bg-green-600 text-white",
        !bWins && "bg-gray-800 text-gray-500"
      )}>
        {bWins ? <FaArrowUp className="text-xs" /> : tie ? <FaEquals className="text-xs" /> : <FaArrowDown className="text-xs" />}
      </div>
    </div>
  );
}

// Transformation Compare
function TransformCompare({ transformsA, transformsB }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-right">
        {transformsA.map(t => (
          <div key={t.tag} className="text-green-400">{t.tag}</div>
        ))}
      </div>
      <div className="text-center text-gray-500">transforms</div>
      <div className="text-left">
        {transformsB.map(t => (
          <div key={t.tag} className="text-green-400">{t.tag}</div>
        ))}
      </div>
    </div>
  );
}
