/**
 * UpgradePrompt Component
 * 
 * Muestra prompt elegante para upgrade cuando usuario intenta
 * acceder a feature premium. Diseñado para no ser molesto.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TIER_CONFIG, TIERS } from '../../config/subscriptions';

/**
 * Inline upgrade prompt - se muestra donde estaría el contenido premium
 */
export function UpgradePrompt({ 
  feature, 
  upgradeInfo, 
  variant = 'inline', // 'inline' | 'modal' | 'banner' | 'tooltip'
  onDismiss,
  className = ''
}) {
  const targetTier = upgradeInfo?.requiredTier || TIERS.PRO;
  const tierConfig = TIER_CONFIG[targetTier];
  
  if (variant === 'inline') {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 ${className}`}>
        {/* Blur overlay effect */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <span className="text-2xl">{tierConfig.badge?.icon || '⚡'}</span>
          
          <div>
            <h4 className="font-heading text-lg text-amber-400 mb-1">
              {upgradeInfo?.message || 'Feature Premium'}
            </h4>
            <p className="text-sm text-text-dim">
              {upgradeInfo?.benefit}
            </p>
          </div>
          
          <Link 
            to="/pricing"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-heading rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
          >
            Desbloquear {tierConfig.name} - €{tierConfig.price}/mes
          </Link>
        </div>
      </div>
    );
  }
  
  if (variant === 'banner') {
    return (
      <div className={`flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-b border-amber-500/20 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{tierConfig.badge?.icon || '⚡'}</span>
          <div>
            <span className="font-heading text-amber-400">{upgradeInfo?.message}</span>
            <span className="text-text-dim ml-2">-</span>
            <span className="text-text-dim ml-2 text-sm">{upgradeInfo?.benefit}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            to="/pricing"
            className="px-3 py-1.5 bg-amber-500 text-white text-sm font-heading rounded hover:bg-amber-600 transition"
          >
            Ver PRO
          </Link>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-text-dim hover:text-white transition p-1"
              aria-label="Cerrar"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
  
  if (variant === 'tooltip') {
    return (
      <div className={`absolute z-50 w-64 p-3 bg-surface-raised border border-amber-500/30 rounded-lg shadow-xl ${className}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{tierConfig.badge?.icon || '⚡'}</span>
          <div className="flex-1">
            <p className="text-sm font-heading text-amber-400 mb-1">
              {upgradeInfo?.message}
            </p>
            <p className="text-xs text-text-dim mb-2">
              {upgradeInfo?.benefit}
            </p>
            <Link 
              to="/pricing"
              className="text-xs text-amber-400 hover:text-amber-300 font-heading"
            >
              Ver planes →
            </Link>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-surface-raised" />
      </div>
    );
  }
  
  return null;
}

/**
 * Modal upgrade prompt - para acciones bloqueadas importantes
 */
export function UpgradeModal({ 
  isOpen, 
  onClose, 
  feature,
  upgradeInfo 
}) {
  const targetTier = upgradeInfo?.requiredTier || TIERS.PRO;
  const tierConfig = TIER_CONFIG[targetTier];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-surface-raised border border-amber-500/30 rounded-xl shadow-2xl overflow-hidden">
              {/* Header con gradiente */}
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6 text-center">
                <span className="text-5xl mb-4 block">{tierConfig.badge?.icon || '⚡'}</span>
                <h2 className="text-2xl font-heading text-white mb-2">
                  {upgradeInfo?.message || 'Desbloquea esta función'}
                </h2>
                <p className="text-text-dim">
                  {upgradeInfo?.benefit}
                </p>
              </div>
              
              {/* Features list */}
              <div className="p-6">
                <h3 className="text-sm font-heading text-text-dim uppercase tracking-wide mb-3">
                  {tierConfig.name} incluye:
                </h3>
                <ul className="space-y-2 mb-6">
                  {tierConfig.features.slice(0, 5).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-text">{formatFeatureName(f)}</span>
                    </li>
                  ))}
                  <li className="text-sm text-text-dim">
                    + más funciones...
                  </li>
                </ul>
                
                {/* CTAs */}
                <div className="space-y-3">
                  <Link 
                    to="/pricing"
                    onClick={onClose}
                    className="block w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-heading text-center rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
                  >
                    Ver planes desde €{tierConfig.price}/mes
                  </Link>
                  
                  <button 
                    onClick={onClose}
                    className="block w-full py-2 text-text-dim hover:text-white text-sm transition"
                  >
                    Quizás más tarde
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Wrapper component - blurs children and shows prompt overlay
 */
export function PremiumGate({ 
  feature, 
  upgradeInfo, 
  children, 
  fallback = null 
}) {
  if (!upgradeInfo) {
    // User has access
    return children;
  }
  
  // Show blurred preview with upgrade prompt
  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="blur-sm opacity-50 pointer-events-none select-none">
        {fallback || children}
      </div>
      
      {/* Upgrade prompt overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradePrompt 
          feature={feature} 
          upgradeInfo={upgradeInfo} 
          variant="inline"
        />
      </div>
    </div>
  );
}

/**
 * Usage limit warning
 */
export function UsageLimitWarning({ 
  remaining, 
  maxLimit, 
  itemName = 'uso',
  itemNamePlural = 'usos'
}) {
  if (remaining === Infinity) return null;
  
  const percentUsed = ((maxLimit - remaining) / maxLimit) * 100;
  const isLow = remaining <= 1;
  const isOut = remaining === 0;
  
  if (isOut) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
        <span className="text-red-500">⚠️</span>
        <span className="text-sm text-red-400">
          Has alcanzado tu límite diario. 
          <Link to="/pricing" className="underline ml-1">Actualiza a PRO</Link> para uso ilimitado.
        </span>
      </div>
    );
  }
  
  if (isLow) {
    return (
      <div className="flex items-center gap-2 text-amber-400 text-sm">
        <span>⚡</span>
        <span>
          Te queda {remaining} {remaining === 1 ? itemName : itemNamePlural} hoy
        </span>
      </div>
    );
  }
  
  // Show subtle progress bar when > 50% used
  if (percentUsed > 50) {
    return (
      <div className="text-xs text-text-dim">
        {remaining} {itemNamePlural} restantes hoy
        <div className="w-full h-1 bg-surface-raised rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-amber-500/50 rounded-full transition-all"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>
    );
  }
  
  return null;
}

// Helper to format feature names for display
function formatFeatureName(feature) {
  const names = {
    'synergy_full': 'Análisis de sinergias completo',
    'synergy_suggestions': 'Sugerencias de items',
    'optimal_path': 'Camino óptimo sugerido',
    'save_parser_full': 'Parser de save completo',
    'builds_unlimited': 'Builds ilimitadas',
    'favorites_unlimited': 'Favoritos ilimitados',
    'export_data': 'Exportar datos',
    'no_ads': 'Sin anuncios',
    'profile_customization': 'Personalización de perfil',
    'profile_badge': 'Badge exclusivo',
    'early_access': 'Acceso anticipado',
    'priority_support': 'Soporte prioritario'
  };
  
  return names[feature] || feature.replace(/_/g, ' ');
}

export default UpgradePrompt;
