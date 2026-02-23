/**
 * useCompletionMarks - Hook para gestionar completion marks
 * 
 * Maneja:
 * - Cargar marks del usuario (localStorage + servidor)
 * - Toggle manual de marks
 * - Importación desde save file
 * - Resolución de conflictos manual vs save
 * - Persistencia y sincronización
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  createEmptyMarks, 
  saveDataToMarks, 
  mergeMarks, 
  calculateCompletion,
  MARK_SOURCE,
  MARK_STATUS 
} from '../data/completionMarks';

// Keys para localStorage
const STORAGE_KEY = 'tboi_completion_marks';
const CONFLICT_PENDING_KEY = 'tboi_marks_conflict_pending';

/**
 * @typedef {'replace' | 'keep' | 'merge'} ConflictResolution
 */

export function useCompletionMarks(characterId, userId = null) {
  const [marks, setMarks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingConflict, setPendingConflict] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // ============================================
  // CARGAR MARKS
  // ============================================
  
  useEffect(() => {
    loadMarks();
  }, [characterId, userId]);
  
  const loadMarks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Intentar cargar de localStorage primero (para respuesta rápida)
      const localData = loadFromLocalStorage(characterId);
      if (localData) {
        setMarks(localData);
      }
      
      // 2. Si hay userId, sincronizar con servidor
      if (userId) {
        const serverData = await fetchMarksFromServer(characterId, userId);
        if (serverData) {
          // Usar datos del servidor como fuente de verdad
          setMarks(serverData);
          saveToLocalStorage(characterId, serverData);
        } else if (!localData) {
          // No hay datos en ningún lado, crear vacíos
          const empty = createEmptyMarks(characterId);
          setMarks(empty);
        }
      } else if (!localData) {
        // Usuario no logueado y no hay datos locales
        const empty = createEmptyMarks(characterId);
        setMarks(empty);
      }
      
      // 3. Verificar si hay conflicto pendiente
      const conflict = loadPendingConflict(characterId);
      if (conflict) {
        setPendingConflict(conflict);
      }
      
    } catch (err) {
      console.error('[useCompletionMarks] Error loading marks:', err);
      setError(err.message);
      // Fallback a datos vacíos
      setMarks(createEmptyMarks(characterId));
    } finally {
      setIsLoading(false);
    }
  };
  
  // ============================================
  // TOGGLE MANUAL
  // ============================================
  
  const toggleMark = useCallback(async (markId, newStatus = null) => {
    if (!marks) return;
    
    setMarks(prev => {
      const current = prev.marks[markId]?.status || MARK_STATUS.NONE;
      
      // Si se especifica un status, usarlo. Si no, ciclar.
      let nextStatus;
      if (newStatus !== null) {
        nextStatus = newStatus;
      } else {
        // Ciclo simplificado: none -> hard -> none
        nextStatus = current === MARK_STATUS.NONE ? MARK_STATUS.HARD : MARK_STATUS.NONE;
      }
      
      const updated = {
        ...prev,
        marks: {
          ...prev.marks,
          [markId]: {
            status: nextStatus,
            source: MARK_SOURCE.MANUAL,
            updatedAt: new Date().toISOString(),
          }
        },
        source: prev.source === MARK_SOURCE.SAVE ? MARK_SOURCE.MERGED : MARK_SOURCE.MANUAL,
        lastUpdated: new Date().toISOString(),
      };
      
      // Guardar en localStorage inmediatamente
      saveToLocalStorage(characterId, updated);
      
      // Analytics
      trackEvent('mark_toggle_manual', {
        characterId,
        markId,
        previousStatus: current,
        newStatus: nextStatus,
      });
      
      return updated;
    });
  }, [marks, characterId]);
  
  // ============================================
  // GUARDAR MARKS
  // ============================================
  
  const saveMarks = useCallback(async (newMarksData) => {
    if (!newMarksData) return;
    
    setIsSaving(true);
    
    try {
      // Actualizar estado local
      setMarks(newMarksData);
      
      // Guardar en localStorage
      saveToLocalStorage(characterId, newMarksData);
      
      // Si hay usuario, sincronizar con servidor
      if (userId) {
        await saveMarksToServer(characterId, userId, newMarksData);
      }
      
      return true;
    } catch (err) {
      console.error('[useCompletionMarks] Error saving marks:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [characterId, userId]);
  
  // ============================================
  // IMPORTAR DESDE SAVE
  // ============================================
  
  const importFromSave = useCallback(async (saveCharacterData, saveHash) => {
    if (!saveCharacterData) return;
    
    // Convertir datos del save al formato de marks
    const saveMarks = saveDataToMarks(characterId, saveCharacterData.marks, saveHash);
    
    // Verificar si hay datos manuales existentes con diferencias
    const hasExistingManual = marks && 
      marks.source === MARK_SOURCE.MANUAL && 
      Object.values(marks.marks).some(m => m.status !== MARK_STATUS.NONE);
    
    if (hasExistingManual) {
      // Hay conflicto potencial - guardar para resolución
      const conflict = {
        characterId,
        manualData: marks,
        saveData: saveMarks,
        timestamp: new Date().toISOString(),
      };
      
      savePendingConflict(characterId, conflict);
      setPendingConflict(conflict);
      
      trackEvent('save_import_conflict', { characterId });
      
      return { hasConflict: true, conflict };
    }
    
    // No hay conflicto, aplicar directamente
    await saveMarks(saveMarks);
    
    trackEvent('save_import_marks', {
      characterId,
      marksImported: calculateCompletion(saveMarks).completed,
    });
    
    return { hasConflict: false };
  }, [characterId, marks, saveMarks]);
  
  // ============================================
  // RESOLVER CONFLICTO
  // ============================================
  
  const resolveConflict = useCallback(async (resolution) => {
    if (!pendingConflict) return;
    
    const { manualData, saveData } = pendingConflict;
    let resolvedData;
    
    switch (resolution) {
      case 'replace':
        // Reemplazar con datos del save
        resolvedData = saveData;
        break;
        
      case 'keep':
        // Mantener datos manuales
        resolvedData = manualData;
        break;
        
      case 'merge':
        // Mezclar (solo completar faltantes)
        resolvedData = mergeMarks(manualData, saveData);
        break;
        
      default:
        console.error('[useCompletionMarks] Unknown resolution:', resolution);
        return;
    }
    
    // Guardar datos resueltos
    await saveMarks(resolvedData);
    
    // Limpiar conflicto pendiente
    clearPendingConflict(characterId);
    setPendingConflict(null);
    
    trackEvent('conflict_resolution_choice', {
      characterId,
      resolution,
    });
    
  }, [pendingConflict, characterId, saveMarks]);
  
  // ============================================
  // RESET
  // ============================================
  
  const resetMarks = useCallback(async () => {
    const empty = createEmptyMarks(characterId);
    await saveMarks(empty);
    
    trackEvent('marks_reset', { characterId });
  }, [characterId, saveMarks]);
  
  // ============================================
  // ESTADÍSTICAS
  // ============================================
  
  const completion = marks ? calculateCompletion(marks) : null;
  
  return {
    marks,
    completion,
    isLoading,
    isSaving,
    error,
    pendingConflict,
    
    // Actions
    toggleMark,
    saveMarks,
    importFromSave,
    resolveConflict,
    resetMarks,
    reload: loadMarks,
  };
}

// ============================================
// HELPERS - LOCAL STORAGE
// ============================================

function loadFromLocalStorage(characterId) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const allMarks = JSON.parse(stored);
    return allMarks[characterId] || null;
  } catch (err) {
    console.error('[localStorage] Error loading marks:', err);
    return null;
  }
}

function saveToLocalStorage(characterId, data) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allMarks = stored ? JSON.parse(stored) : {};
    allMarks[characterId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMarks));
  } catch (err) {
    console.error('[localStorage] Error saving marks:', err);
  }
}

function loadPendingConflict(characterId) {
  try {
    const stored = localStorage.getItem(CONFLICT_PENDING_KEY);
    if (!stored) return null;
    
    const conflicts = JSON.parse(stored);
    return conflicts[characterId] || null;
  } catch (err) {
    return null;
  }
}

function savePendingConflict(characterId, conflict) {
  try {
    const stored = localStorage.getItem(CONFLICT_PENDING_KEY);
    const conflicts = stored ? JSON.parse(stored) : {};
    conflicts[characterId] = conflict;
    localStorage.setItem(CONFLICT_PENDING_KEY, JSON.stringify(conflicts));
  } catch (err) {
    console.error('[localStorage] Error saving conflict:', err);
  }
}

function clearPendingConflict(characterId) {
  try {
    const stored = localStorage.getItem(CONFLICT_PENDING_KEY);
    if (!stored) return;
    
    const conflicts = JSON.parse(stored);
    delete conflicts[characterId];
    localStorage.setItem(CONFLICT_PENDING_KEY, JSON.stringify(conflicts));
  } catch (err) {
    console.error('[localStorage] Error clearing conflict:', err);
  }
}

// ============================================
// HELPERS - SERVER API
// ============================================

async function fetchMarksFromServer(characterId, userId) {
  try {
    const response = await fetch(`/api/users/${userId}/marks/${characterId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch marks');
    }
    return await response.json();
  } catch (err) {
    console.error('[API] Error fetching marks:', err);
    return null;
  }
}

async function saveMarksToServer(characterId, userId, data) {
  try {
    const response = await fetch(`/api/users/${userId}/marks/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save marks');
    }
    
    return await response.json();
  } catch (err) {
    console.error('[API] Error saving marks:', err);
    throw err;
  }
}

// ============================================
// ANALYTICS HELPER
// ============================================

function trackEvent(eventName, properties = {}) {
  // Integrar con tu sistema de analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // También log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }
}

export default useCompletionMarks;
