import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { DEFEAT_STATUS, ALL_FLOORS } from '../types/boss.types';

const BossProgressContext = createContext(undefined);

// Local storage keys
const STORAGE_KEY = 'tboi_boss_progress';
const MANUAL_MARKS_KEY = 'tboi_boss_manual_marks';

/**
 * Determines defeat status from progress data
 */
function getDefeatStatus(progress, totalCharacters = 34) {
  if (!progress) return DEFEAT_STATUS.NOT_DEFEATED;
  
  const { normalComplete, hardComplete, charactersDefeated = [] } = progress;
  
  // Mastered = all characters have defeated this boss (or a high threshold like 50%)
  if (charactersDefeated.length >= Math.floor(totalCharacters * 0.5)) {
    return DEFEAT_STATUS.MASTERED;
  }
  
  if (hardComplete) return DEFEAT_STATUS.HARD;
  if (normalComplete) return DEFEAT_STATUS.NORMAL;
  
  return DEFEAT_STATUS.NOT_DEFEATED;
}

/**
 * Provider for boss progress state
 * Merges save file data with manual marks
 */
export function BossProgressProvider({ children }) {
  const { user, session } = useAuth();
  const [saveProgress, setSaveProgress] = useState(null);
  const [manualMarks, setManualMarks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasSaveLoaded, setHasSaveLoaded] = useState(false);

  // Load manual marks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MANUAL_MARKS_KEY);
      if (stored) {
        setManualMarks(JSON.parse(stored));
      }
    } catch (err) {
      console.error('[BossProgress] Error loading manual marks:', err);
    }
  }, []);

  // Load save progress if user has uploaded save
  useEffect(() => {
    const loadSaveProgress = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setHasSaveLoaded(false);
        return;
      }

      setIsLoading(true);
      try {
        // Try to fetch user's parsed save data from API
        const response = await fetch(`/api/save/progress?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.bossProgress) {
            setSaveProgress(data.bossProgress);
            setHasSaveLoaded(true);
          }
        }
      } catch (err) {
        console.error('[BossProgress] Error loading save progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSaveProgress();
  }, [user?.id, session?.access_token]);

  // Persist manual marks
  const saveManualMarks = useCallback((marks) => {
    try {
      localStorage.setItem(MANUAL_MARKS_KEY, JSON.stringify(marks));
    } catch (err) {
      console.error('[BossProgress] Error saving manual marks:', err);
    }
  }, []);

  /**
   * Get progress for a specific boss
   * Merges save data with manual marks (manual takes precedence if higher)
   */
  const getBossProgress = useCallback((bossId) => {
    const fromSave = saveProgress?.[bossId] || null;
    const fromManual = manualMarks[bossId] || null;

    if (!fromSave && !fromManual) return null;

    // Merge: take the "higher" progress state
    if (!fromSave) return fromManual;
    if (!fromManual) return fromSave;

    return {
      bossId,
      normalComplete: fromSave.normalComplete || fromManual.normalComplete,
      hardComplete: fromSave.hardComplete || fromManual.hardComplete,
      charactersDefeated: [
        ...new Set([
          ...(fromSave.charactersDefeated || []),
          ...(fromManual.charactersDefeated || [])
        ])
      ],
      firstDefeatDate: fromSave.firstDefeatDate || fromManual.firstDefeatDate
    };
  }, [saveProgress, manualMarks]);

  /**
   * Get defeat status for a boss
   */
  const getBossStatus = useCallback((bossId) => {
    const progress = getBossProgress(bossId);
    return getDefeatStatus(progress);
  }, [getBossProgress]);

  /**
   * Mark boss as defeated manually
   */
  const markAsDefeated = useCallback((bossId, options = {}) => {
    const { mode = 'normal', character = null } = options;
    
    setManualMarks(prev => {
      const existing = prev[bossId] || {
        bossId,
        normalComplete: false,
        hardComplete: false,
        charactersDefeated: [],
        firstDefeatDate: null
      };

      const updated = {
        ...existing,
        normalComplete: true,
        hardComplete: mode === 'hard' ? true : existing.hardComplete,
        charactersDefeated: character 
          ? [...new Set([...existing.charactersDefeated, character])]
          : existing.charactersDefeated,
        firstDefeatDate: existing.firstDefeatDate || new Date().toISOString()
      };

      const newMarks = { ...prev, [bossId]: updated };
      saveManualMarks(newMarks);
      return newMarks;
    });
  }, [saveManualMarks]);

  /**
   * Remove manual mark (reset to save data or not defeated)
   */
  const removeManualMark = useCallback((bossId) => {
    setManualMarks(prev => {
      const { [bossId]: removed, ...rest } = prev;
      saveManualMarks(rest);
      return rest;
    });
  }, [saveManualMarks]);

  /**
   * Calculate overall progress stats
   */
  const getOverallProgress = useCallback((bossList) => {
    if (!bossList?.length) {
      return { total: 0, defeated: 0, hardComplete: 0, mastered: 0, percentage: 0 };
    }

    let defeated = 0;
    let hardComplete = 0;
    let mastered = 0;

    bossList.forEach(boss => {
      const status = getBossStatus(boss.id);
      if (status !== DEFEAT_STATUS.NOT_DEFEATED) {
        defeated++;
        if (status === DEFEAT_STATUS.HARD || status === DEFEAT_STATUS.MASTERED) {
          hardComplete++;
        }
        if (status === DEFEAT_STATUS.MASTERED) {
          mastered++;
        }
      }
    });

    return {
      total: bossList.length,
      defeated,
      hardComplete,
      mastered,
      percentage: Math.round((defeated / bossList.length) * 100)
    };
  }, [getBossStatus]);

  /**
   * Calculate progress per floor
   */
  const getFloorProgress = useCallback((bossList) => {
    const floorMap = {};
    
    // Initialize all floors
    ALL_FLOORS.forEach(floor => {
      floorMap[floor.id] = {
        floorId: floor.id,
        name: floor.name,
        total: 0,
        defeated: 0,
        hardComplete: 0,
        percentage: 0
      };
    });

    // Count bosses per floor
    bossList?.forEach(boss => {
      const floorId = boss.location?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
      const matchedFloor = Object.keys(floorMap).find(fId => 
        floorId.includes(fId) || fId.includes(floorId.split('/')[0].trim().toLowerCase().replace(/\s+/g, '-'))
      );
      
      const targetFloor = matchedFloor || 'basement'; // fallback
      
      if (floorMap[targetFloor]) {
        floorMap[targetFloor].total++;
        
        const status = getBossStatus(boss.id);
        if (status !== DEFEAT_STATUS.NOT_DEFEATED) {
          floorMap[targetFloor].defeated++;
          if (status === DEFEAT_STATUS.HARD || status === DEFEAT_STATUS.MASTERED) {
            floorMap[targetFloor].hardComplete++;
          }
        }
      }
    });

    // Calculate percentages
    Object.values(floorMap).forEach(floor => {
      floor.percentage = floor.total > 0 
        ? Math.round((floor.defeated / floor.total) * 100)
        : 0;
    });

    return floorMap;
  }, [getBossStatus]);

  const value = useMemo(() => ({
    // State
    isLoading,
    hasSaveLoaded,
    saveProgress,
    manualMarks,
    
    // Methods
    getBossProgress,
    getBossStatus,
    markAsDefeated,
    removeManualMark,
    getOverallProgress,
    getFloorProgress,
    
    // Refresh (for after save upload)
    refreshProgress: () => {
      // Trigger reload
      setSaveProgress(null);
      setHasSaveLoaded(false);
    }
  }), [
    isLoading,
    hasSaveLoaded,
    saveProgress,
    manualMarks,
    getBossProgress,
    getBossStatus,
    markAsDefeated,
    removeManualMark,
    getOverallProgress,
    getFloorProgress
  ]);

  return (
    <BossProgressContext.Provider value={value}>
      {children}
    </BossProgressContext.Provider>
  );
}

/**
 * Hook to access boss progress context
 */
export function useBossProgress() {
  const context = useContext(BossProgressContext);
  if (context === undefined) {
    throw new Error('useBossProgress must be used within a BossProgressProvider');
  }
  return context;
}

export default BossProgressContext;
