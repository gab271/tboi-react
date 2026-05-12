/**
 * TransformationTracker — Dead God Codex
 * Panel lateral que muestra el progreso de las transformaciones
 * basado en la colección completa del jugador.
 */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaDna } from 'react-icons/fa';
import { useTransformationProgress } from '../hooks/useTransformationProgress';
import { cn } from '../../../lib/utils';

// ─── Contenedor principal ──────────────────────────────────────────────────────

export const TransformationTracker = memo(function TransformationTracker({
  collectedItemIds = [],
}) {
  const transformations = useTransformationProgress(collectedItemIds);
  const completedCount = transformations.filter(t => t.complete).length;
  const totalCount = transformations.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-48 flex flex-col gap-3"
      style={{ maxHeight: 'calc(100vh - 220px)' }}
    >
      {/* ── Cabecera del Codex ─────────────────────────────────── */}
      <div
        className="rounded-lg border border-white/10 p-4 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #181008 0%, #0a0a0a 100%)' }}
      >
        {/* Textura de ruido sutil */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
              <FaDna className="text-accent-gold text-sm" />
            </div>
            <div>
              <h3 className="font-heading text-[10px] text-white uppercase tracking-[0.15em] leading-none">
                Transformation
              </h3>
              <p className="font-pixel text-[9px] text-accent-gold/70 leading-none mt-0.5">
                Codex
              </p>
            </div>
            <div className="ml-auto text-right">
              <span className="font-pixel text-xl leading-none" style={{ color: completedCount === totalCount ? '#FFD700' : '#ccc' }}>
                {completedCount}
              </span>
              <span className="font-pixel text-xs text-gray-600">/{totalCount}</span>
            </div>
          </div>

          {/* Barra de progreso global */}
          <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full"
              style={{
                background: completedCount === totalCount
                  ? 'linear-gradient(90deg, #D4A024, #FFD700, #D4A024)'
                  : 'linear-gradient(90deg, #C64040, #D4A024)',
                boxShadow: completedCount > 0 ? '0 0 8px rgba(212,160,36,0.5)' : 'none',
              }}
            />
          </div>

          {completedCount === totalCount && (
            <p className="font-handwriting text-xs text-accent-gold mt-2 text-center animate-transform-complete">
              Dead God — todas las transformaciones obtenidas ✦
            </p>
          )}
        </div>
      </div>

      {/* ── Lista de transformaciones ──────────────────────────── */}
      <div className="flex flex-col gap-1.5 overflow-y-auto lab-scrollbar pr-0.5 flex-1">
        {transformations.map((t, i) => (
          <TransformationCard key={t.key} transformation={t} index={i} />
        ))}
      </div>
    </motion.div>
  );
});

// ─── Card individual ───────────────────────────────────────────────────────────

function TransformationCard({ transformation, index }) {
  const { info, current, threshold, complete } = transformation;
  const percent = (current / threshold) * 100;
  const isEmpty = current === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isEmpty ? 0.38 : 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-500',
        complete
          ? 'border-accent-gold/50 animate-transform-complete'
          : current > 0
          ? 'border-white/15'
          : 'border-white/5',
      )}
      style={{
        background: complete
          ? `linear-gradient(135deg, ${info.color}22 0%, #0c0906 70%)`
          : current > 0
          ? 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, #080808 100%)'
          : '#070707',
      }}
    >
      {/* Barra de acento izquierda */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg transition-all duration-500"
        style={{
          background: complete
            ? `linear-gradient(180deg, ${info.color}, ${info.color}60)`
            : current > 0
            ? `${info.color}50`
            : '#1a1a1a',
          boxShadow: complete ? `0 0 8px ${info.color}80` : 'none',
        }}
      />

      <div className="pl-4 pr-3 py-2.5">
        {/* Fila superior: icono + nombre + fracción */}
        <div className="flex items-center gap-2 mb-2">
          {/* Altar / pedestal del ícono */}
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 border text-[18px] leading-none"
            style={{
              background: complete ? `${info.color}20` : '#111',
              borderColor: complete ? `${info.color}60` : '#1e1e1e',
              boxShadow: complete ? `inset 0 0 12px ${info.color}30` : 'none',
              filter: isEmpty ? 'grayscale(1) brightness(0.4)' : 'none',
            }}
          >
            {info.icon}
          </div>

          {/* Nombre */}
          <div className="flex-1 min-w-0">
            <p
              className="font-heading text-[9px] uppercase tracking-[0.12em] leading-none truncate"
              style={{
                color: complete ? info.color : current > 0 ? '#c0c0c0' : '#383838',
              }}
            >
              {info.name}
            </p>
            {complete && (
              <p
                className="font-pixel text-[8px] mt-0.5 leading-none"
                style={{ color: `${info.color}99` }}
              >
                ACHIEVED
              </p>
            )}
          </div>

          {/* Fracción */}
          <span
            className="font-pixel text-lg leading-none flex-shrink-0"
            style={{ color: complete ? '#FFD700' : current > 0 ? '#666' : '#2a2a2a' }}
          >
            {current}/{threshold}
          </span>
        </div>

        {/* Slots — pedestales de ítems */}
        <div className="flex gap-1.5 mb-2">
          {Array.from({ length: threshold }).map((_, i) => {
            const filled = i < current;
            return (
              <SlotCell
                key={i}
                filled={filled}
                complete={complete}
                color={info.color}
                delay={i * 0.06}
              />
            );
          })}
        </div>

        {/* Barra de progreso */}
        <div className="h-[3px] bg-black/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, percent)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.04 }}
            className="h-full rounded-full"
            style={{
              background: complete
                ? `linear-gradient(90deg, ${info.color}, #FFD700)`
                : `${info.color}90`,
              boxShadow: complete ? `0 0 6px ${info.color}80` : 'none',
            }}
          />
        </div>

        {/* Descripción del efecto cuando está completa */}
        {complete && info.description && (
          <p
            className="font-handwriting text-[11px] mt-1.5 leading-tight"
            style={{ color: `${info.color}aa` }}
          >
            {info.description}
          </p>
        )}
      </div>

      {/* Shimmer de celebración cuando está completa */}
      {complete && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12" />
        </div>
      )}
    </motion.div>
  );
}

// ─── Slot individual (pedestal) ────────────────────────────────────────────────

function SlotCell({ filled, complete, color, delay }) {
  return (
    <motion.div
      initial={false}
      animate={
        filled
          ? { scale: [1, 1.25, 1], transition: { duration: 0.28, delay } }
          : { scale: 1 }
      }
      className="w-5 h-5 rounded-sm border flex items-center justify-center text-[9px] font-bold transition-all duration-300"
      style={{
        backgroundColor: filled ? `${color}35` : '#0e0e0e',
        borderColor: filled ? (complete ? color : `${color}80`) : '#1e1e1e',
        color: filled ? (complete ? '#FFD700' : color) : 'transparent',
        boxShadow: filled && complete ? `0 0 8px ${color}60, inset 0 0 4px ${color}30` : 'none',
      }}
    >
      {filled ? '✦' : ''}
    </motion.div>
  );
}
