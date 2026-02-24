/**
 * ConflictResolutionModal - Modal para resolver conflictos entre marks manuales y del save
 * 
 * Muestra una comparación visual y permite al usuario elegir:
 * - Reemplazar: usar datos del save
 * - Mantener: conservar datos manuales
 * - Mezclar: combinar con prioridad al mayor progreso
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Hand, GitMerge, AlertTriangle, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COMPLETION_MARKS, MARK_STATUS, calculateCompletion } from '../data/completionMarks';
import './ConflictResolutionModal.css';

export function ConflictResolutionModal({ 
  isOpen, 
  onClose, 
  conflict, 
  onResolve 
}) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  
  if (!conflict) return null;
  
  const { manualData, saveData } = conflict;
  const manualCompletion = calculateCompletion(manualData);
  const saveCompletion = calculateCompletion(saveData);
  
  const handleResolve = async () => {
    if (!selectedOption) return;
    
    setIsResolving(true);
    try {
      await onResolve(selectedOption);
      onClose();
    } catch (err) {
      console.error('Error resolving conflict:', err);
    } finally {
      setIsResolving(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="conflict-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="conflict-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="conflict-modal-header">
              <div className="conflict-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2>{t('characters.conflict.title', 'Conflicto detectado')}</h2>
                <p>{t('characters.conflict.description', 'Tus marcas manuales difieren del save importado')}</p>
              </div>
              <button 
                className="conflict-modal-close"
                onClick={onClose}
                aria-label={t('common.close', 'Cerrar')}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Comparison */}
            <div className="conflict-comparison">
              <ComparisonColumn
                title={t('characters.conflict.manual', 'Marcas manuales')}
                icon={<Hand size={18} />}
                marks={manualData.marks}
                completion={manualCompletion}
              />
              
              <div className="conflict-vs">
                <span>{t('common.vs')}</span>
              </div>
              
              <ComparisonColumn
                title={t('characters.conflict.save', 'Desde save')}
                icon={<Upload size={18} />}
                marks={saveData.marks}
                completion={saveCompletion}
              />
            </div>
            
            {/* Options */}
            <div className="conflict-options">
              <OptionCard
                id="replace"
                icon={<Upload size={20} />}
                title={t('characters.conflict.options.replace.title', 'Usar save')}
                description={t('characters.conflict.options.replace.description', 'Reemplazar marcas con datos del archivo de guardado')}
                selected={selectedOption === 'replace'}
                onClick={() => setSelectedOption('replace')}
              />
              
              <OptionCard
                id="keep"
                icon={<Hand size={20} />}
                title={t('characters.conflict.options.keep.title', 'Mantener manual')}
                description={t('characters.conflict.options.keep.description', 'Conservar tus marcas manuales actuales')}
                selected={selectedOption === 'keep'}
                onClick={() => setSelectedOption('keep')}
              />
              
              <OptionCard
                id="merge"
                icon={<GitMerge size={20} />}
                title={t('characters.conflict.options.merge.title', 'Mezclar')}
                description={t('characters.conflict.options.merge.description', 'Combinar conservando el mayor progreso de cada marca')}
                selected={selectedOption === 'merge'}
                recommended
                onClick={() => setSelectedOption('merge')}
              />
            </div>
            
            {/* Actions */}
            <div className="conflict-modal-actions">
              <button 
                className="conflict-btn-cancel"
                onClick={onClose}
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              
              <button
                className="conflict-btn-resolve"
                onClick={handleResolve}
                disabled={!selectedOption || isResolving}
              >
                {isResolving ? (
                  <span className="conflict-btn-loading" />
                ) : (
                  <>
                    <Check size={18} />
                    {t('characters.conflict.apply', 'Aplicar')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Sub-component: Comparison column
function ComparisonColumn({ title, icon, marks, completion }) {
  return (
    <div className="comparison-column">
      <div className="comparison-header">
        {icon}
        <span>{title}</span>
      </div>
      
      <div className="comparison-grid">
        {COMPLETION_MARKS.map(mark => {
          const status = marks[mark.id]?.status || MARK_STATUS.NONE;
          return (
            <div 
              key={mark.id}
              className={`comparison-mark ${status === MARK_STATUS.HARD ? 'completed' : status === MARK_STATUS.NORMAL ? 'normal' : ''}`}
              title={mark.name}
            >
              <img src={mark.icon} alt={mark.name} />
            </div>
          );
        })}
      </div>
      
      <div className="comparison-stats">
        <span className="comparison-percent">{completion.percent}%</span>
        <span className="comparison-count">
          {completion.completed}/{completion.total}
        </span>
      </div>
    </div>
  );
}

// Sub-component: Option card
function OptionCard({ id, icon, title, description, selected, recommended, onClick }) {
  const { t } = useTranslation();
  
  return (
    <button
      className={`option-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`}
      onClick={onClick}
      type="button"
    >
      <div className="option-icon">{icon}</div>
      <div className="option-content">
        <span className="option-title">
          {title}
          {recommended && (
            <span className="option-badge">{t('common.recommended')}</span>
          )}
        </span>
        <span className="option-description">{description}</span>
      </div>
      <div className="option-check">
        {selected && <Check size={18} />}
      </div>
    </button>
  );
}

export default ConflictResolutionModal;
