/**
 * CompletionMarksGrid - Grid de completion marks con iconos reales del juego
 * 
 * Features:
 * - Iconos reales de bosses del juego
 * - Modo edición con toggle de marks
 * - Estados: locked (gris), normal (negro), hard (rojo)
 * - Tooltips con info del boss
 * - Accesibilidad: navegación por teclado
 * - Soporte para datos de save file o edición manual
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';
import { 
  COMPLETION_MARKS, 
  MARK_STATUS, 
  MARK_SOURCE,
  createEmptyMarks,
  calculateCompletion 
} from '../data/completionMarks';
import { FaPencilAlt, FaSave, FaTimes, FaLock, FaUnlock } from 'react-icons/fa';

// ============================================
// MARK CELL COMPONENT
// ============================================

function MarkCell({ 
  mark, 
  status = MARK_STATUS.NONE, 
  source,
  isEditing = false,
  isTainted = false,
  onToggle,
  tabIndex = 0,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isCompleted = status !== MARK_STATUS.NONE;
  const isHard = status === MARK_STATUS.HARD;
  
  // Colores según estado
  const getOverlayColor = () => {
    if (!isCompleted) return 'grayscale brightness-50'; // Locked/Gris
    if (isHard) return ''; // Hard = color original (rojo en tainted, dorado en normal)
    return 'grayscale-[30%] brightness-90'; // Normal = ligeramente desaturado
  };
  
  // Borde según estado
  const getBorderColor = () => {
    if (isEditing) {
      if (isHovered) return 'ring-2 ring-accent-gold ring-offset-1';
      return 'ring-1 ring-border-light';
    }
    if (isCompleted && isHard) {
      return isTainted ? 'ring-2 ring-red-600' : 'ring-2 ring-amber-500';
    }
    if (isCompleted) {
      return 'ring-1 ring-text-secondary';
    }
    return '';
  };
  
  // Handle click/toggle
  const handleClick = () => {
    if (!isEditing) return;
    onToggle?.(mark.id);
  };
  
  // Handle keyboard
  const handleKeyDown = (e) => {
    if (!isEditing) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle?.(mark.id);
    }
  };
  
  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => { setIsHovered(true); setShowTooltip(true); }}
        onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        disabled={!isEditing}
        tabIndex={isEditing ? tabIndex : -1}
        className={cn(
          "relative w-full aspect-square rounded-sm overflow-hidden transition-all duration-200",
          "flex items-center justify-center",
          "bg-bg-paper-dark/50",
          getBorderColor(),
          isEditing && "cursor-pointer hover:scale-105 active:scale-95",
          !isEditing && isCompleted && "cursor-default",
          !isEditing && !isCompleted && "cursor-not-allowed opacity-60"
        )}
        whileHover={isEditing ? { scale: 1.05 } : {}}
        whileTap={isEditing ? { scale: 0.95 } : {}}
        aria-label={`${mark.label}: ${isCompleted ? (isHard ? 'Hard complete' : 'Normal complete') : 'Not completed'}`}
        aria-pressed={isCompleted}
      >
        {/* Boss Icon */}
        <div className={cn(
          "w-full h-full p-1 transition-all duration-300",
          getOverlayColor()
        )}>
          <img 
            src={mark.icon}
            alt={mark.label}
            className="w-full h-full object-contain pixelated"
            loading="lazy"
            onError={(e) => {
              // Fallback a texto si la imagen no carga
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback text */}
          <div className="hidden items-center justify-center text-[10px] font-heading text-text-dim">
            {mark.labelShort}
          </div>
        </div>
        
        {/* Stamp overlay para completed */}
        {isCompleted && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: Math.random() * 10 - 5 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center pointer-events-none",
              isHard 
                ? (isTainted ? "text-red-600" : "text-amber-600") 
                : "text-text-secondary"
            )}
          >
            <div className={cn(
              "absolute inset-1 border-2 rounded-sm opacity-30",
              isHard 
                ? (isTainted ? "border-red-600" : "border-amber-500") 
                : "border-text-secondary"
            )} />
          </motion.div>
        )}
        
        {/* Edit mode indicator */}
        {isEditing && (
          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-accent-gold/80 flex items-center justify-center">
            <span className="text-[8px] text-white">
              {isCompleted ? '✓' : '+'}
            </span>
          </div>
        )}
        
        {/* Source indicator */}
        {source === MARK_SOURCE.SAVE && isCompleted && !isEditing && (
          <div className="absolute bottom-0.5 left-0.5 w-3 h-3" title="From save file">
            <FaLock className="w-full h-full text-text-dim/50" />
          </div>
        )}
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                       bg-text-ink text-bg-paper text-[10px] font-heading rounded shadow-lg
                       whitespace-nowrap pointer-events-none"
          >
            <div className="font-bold">{mark.label}</div>
            <div className="text-bg-paper/70 text-[9px]">
              {isCompleted 
                ? (isHard ? '✓ Hard Mode' : '✓ Normal') 
                : 'Not completed'
              }
            </div>
            {isEditing && (
              <div className="text-accent-gold text-[9px] mt-0.5">
                Click to toggle
              </div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
                            border-l-4 border-r-4 border-t-4 
                            border-l-transparent border-r-transparent border-t-text-ink" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MAIN GRID COMPONENT
// ============================================

export function CompletionMarksGrid({
  characterId,
  characterName,
  isTainted = false,
  initialMarks = null,
  source = MARK_SOURCE.MANUAL,
  editable = true,
  onSave,
  onCancel,
  className,
}) {
  const { t } = useTranslation();
  
  // Estado local de marks
  const [marks, setMarks] = useState(() => 
    initialMarks?.marks || createEmptyMarks(characterId).marks
  );
  const [isEditing, setIsEditing] = useState(false);
  const [originalMarks, setOriginalMarks] = useState(marks);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'normal' | 'hard'
  
  // Sync when initialMarks changes (e.g., after loading from server)
  useEffect(() => {
    if (initialMarks?.marks) {
      setMarks(initialMarks.marks);
      setOriginalMarks(initialMarks.marks);
    }
  }, [initialMarks]);
  
  // Calcular progreso - con filtrado por modo
  const completion = useMemo(() => {
    const base = calculateCompletion({ marks });
    
    // Contadores filtrados
    if (viewMode === 'normal') {
      const normalOnly = Object.values(marks).filter(m => m?.status === MARK_STATUS.NORMAL).length;
      return {
        ...base,
        filteredCompleted: normalOnly,
        filterLabel: 'Normal'
      };
    } else if (viewMode === 'hard') {
      const hardOnly = Object.values(marks).filter(m => m?.status === MARK_STATUS.HARD).length;
      return {
        ...base,
        filteredCompleted: hardOnly,
        filterLabel: 'Hard'
      };
    }
    
    return {
      ...base,
      filteredCompleted: base.completed,
      filterLabel: 'All'
    };
  }, [marks, viewMode]);
  
  // Toggle de un mark (cicla: none -> normal -> hard -> none)
  const handleToggle = useCallback((markId) => {
    setMarks(prev => {
      const current = prev[markId]?.status || MARK_STATUS.NONE;
      let nextStatus;
      
      // Ciclo: none -> hard -> none (simplificado para UX)
      // Si quieres normal: none -> normal -> hard -> none
      if (current === MARK_STATUS.NONE) {
        nextStatus = MARK_STATUS.HARD;
      } else {
        nextStatus = MARK_STATUS.NONE;
      }
      
      return {
        ...prev,
        [markId]: {
          ...prev[markId],
          status: nextStatus,
          source: MARK_SOURCE.MANUAL,
          updatedAt: new Date().toISOString(),
        }
      };
    });
  }, []);
  
  // Entrar en modo edición
  const handleStartEdit = () => {
    setOriginalMarks(marks);
    setIsEditing(true);
  };
  
  // Guardar cambios
  const handleSave = async () => {
    const data = {
      characterId,
      marks,
      source: MARK_SOURCE.MANUAL,
      lastUpdated: new Date().toISOString(),
      saveFileHash: null,
    };
    
    if (onSave) {
      await onSave(data);
    }
    
    setIsEditing(false);
  };
  
  // Cancelar edición
  const handleCancel = () => {
    setMarks(originalMarks);
    setIsEditing(false);
    onCancel?.();
  };
  
  return (
    <div className={cn(
      "relative bg-bg-paper rounded-lg border-2 border-border shadow-md p-3",
      isTainted && "border-red-900/30 bg-red-50/30",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-heading text-sm text-text-ink">
            Completion Marks
          </h4>
          <p className="text-[11px] text-text-dim">
            {viewMode === 'all' ? (
              <>
                {completion.completed}/{completion.total}
                {completion.hardCompleted > 0 && (
                  <span className={isTainted ? "text-red-600" : "text-amber-600"}>
                    {' '}({completion.hardCompleted} hard)
                  </span>
                )}
              </>
            ) : (
              <>
                {completion.filteredCompleted}/{completion.total} ({completion.filterLabel})
              </>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mode selector - Normal/Hard toggle */}
          {!isEditing && (
            <div className="flex items-center bg-bg-paper-dark/50 rounded-full p-0.5">
              <button
                onClick={() => setViewMode('all')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-heading rounded-full transition-colors",
                  viewMode === 'all' 
                    ? "bg-white text-text-ink shadow-sm" 
                    : "text-text-dim hover:text-text-ink"
                )}
              >
                All
              </button>
              <button
                onClick={() => setViewMode('normal')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-heading rounded-full transition-colors",
                  viewMode === 'normal' 
                    ? "bg-slate-600 text-white shadow-sm" 
                    : "text-text-dim hover:text-text-ink"
                )}
              >
                Normal
              </button>
              <button
                onClick={() => setViewMode('hard')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-heading rounded-full transition-colors",
                  viewMode === 'hard' 
                    ? (isTainted ? "bg-red-600 text-white" : "bg-amber-500 text-white") + " shadow-sm"
                    : "text-text-dim hover:text-text-ink"
                )}
              >
                Hard
              </button>
            </div>
          )}
          
          {/* Edit controls */}
          {editable && (
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded text-text-secondary hover:text-accent-blood hover:bg-accent-blood/10 transition-colors"
                  title={t('characters.cancelEdit')}
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1.5 rounded text-text-secondary hover:text-green-600 hover:bg-green-100 transition-colors"
                  title={t('characters.saveChanges')}
                >
                  <FaSave className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEdit}
                className="p-1.5 rounded text-text-secondary hover:text-accent-gold hover:bg-accent-gold/10 transition-colors"
                title={t('characters.editManually')}
              >
                <FaPencilAlt className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-bg-paper-dark rounded-full mb-3 overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isTainted ? "bg-red-600" : "bg-amber-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${completion.percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Grid 4x3 */}
      <div 
        className="grid grid-cols-4 gap-1.5"
        role="grid"
        aria-label={`Completion marks for ${characterName}`}
      >
        {COMPLETION_MARKS.map((mark, index) => (
          <MarkCell
            key={mark.id}
            mark={mark}
            status={marks[mark.id]?.status || MARK_STATUS.NONE}
            source={marks[mark.id]?.source}
            isEditing={isEditing}
            isTainted={isTainted}
            onToggle={handleToggle}
            tabIndex={index}
          />
        ))}
      </div>
      
      {/* Source indicator */}
      {source && !isEditing && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-text-dim">
          {source === MARK_SOURCE.SAVE ? (
            <>
              <FaLock className="w-2.5 h-2.5" />
              <span>{t('characters.fromSaveFile')}</span>
            </>
          ) : source === MARK_SOURCE.MERGED ? (
            <>
              <FaUnlock className="w-2.5 h-2.5" />
              <span>Manual + Save</span>
            </>
          ) : (
            <>
              <FaPencilAlt className="w-2.5 h-2.5" />
              <span>{t('characters.manualEntry')}</span>
            </>
          )}
        </div>
      )}
      
      {/* Edit mode overlay indicator */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-1 -right-1 px-2 py-0.5 bg-accent-gold text-white 
                       text-[10px] font-heading rounded shadow-sm"
          >
            Editing
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CompletionMarksGrid;
