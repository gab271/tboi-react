/**
 * useBuildLab Hook
 * Hook principal para gestionar el laboratorio de builds
 */
import { useCallback, useEffect, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useBuildLabContext } from '../context/BuildLabContext';
import { calculateBuildState, calculateItemImpact } from '../lib/effectCalculator';
import { analyzeBuild } from '../api/collectionLabApi';

export function useBuildLab() {
  const context = useBuildLabContext();
  const {
    selectedItems,
    buildState,
    setBuildState,
    mode,
    settings,
  } = context;
  
  // ═══════════════════════════════════════════════════════════
  // CÁLCULO LOCAL DE BUILD STATE
  // ═══════════════════════════════════════════════════════════
  
  // Calcular estado de build localmente cuando cambian los items
  useEffect(() => {
    if (selectedItems.length === 0) {
      setBuildState(null);
      return;
    }
    
    if (!settings.autoCalculate) return;
    
    // Calcular localmente (para respuesta instantánea)
    const localState = calculateBuildState(selectedItems);
    setBuildState(localState);
  }, [selectedItems, settings.autoCalculate, setBuildState]);
  
  // ═══════════════════════════════════════════════════════════
  // ANÁLISIS EN SERVIDOR (para datos extra como explicaciones)
  // ═══════════════════════════════════════════════════════════
  
  const analyzeServerMutation = useMutation({
    mutationFn: (itemIds) => analyzeBuild(itemIds),
    onSuccess: (serverData) => {
      // Merge con estado local
      if (serverData?.build?.state) {
        setBuildState(prev => ({
          ...prev,
          ...serverData.build.state,
          explanation: serverData.build.explanation,
          serverRating: serverData.build.rating,
        }));
      }
    }
  });
  
  // Trigger análisis del servidor cuando hay suficientes items
  const analyzeOnServer = useCallback(() => {
    if (selectedItems.length >= 2) {
      const itemIds = selectedItems.map(i => i.id).filter(Boolean);
      if (itemIds.length > 0) {
        analyzeServerMutation.mutate(itemIds);
      }
    }
  }, [selectedItems, analyzeServerMutation]);
  
  // ═══════════════════════════════════════════════════════════
  // HELPERS DE IMPACTO
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Calcula el impacto de añadir un item
   */
  const getItemImpact = useCallback((item) => {
    return calculateItemImpact(item, selectedItems);
  }, [selectedItems]);
  
  /**
   * Preview de stats con un item añadido (sin añadirlo realmente)
   */
  const previewWithItem = useCallback((item) => {
    return calculateBuildState([...selectedItems, item]);
  }, [selectedItems]);
  
  /**
   * Preview de stats sin un item (para mostrar qué se pierde)
   */
  const previewWithoutItem = useCallback((itemId) => {
    const filtered = selectedItems.filter(i => i.id !== itemId);
    return calculateBuildState(filtered);
  }, [selectedItems]);
  
  // ═══════════════════════════════════════════════════════════
  // MÉTRICAS DERIVADAS
  // ═══════════════════════════════════════════════════════════
  
  const metrics = useMemo(() => {
    if (!buildState) return null;
    
    return {
      // DPS y daño
      dps: Math.round(buildState.finalDPS),
      damage: buildState.finalDamage?.toFixed(2),
      damageMultiplier: buildState.damageMultiplier?.toFixed(2),
      
      // Fire rate
      tearsPerSecond: buildState.tearsPerSecond?.toFixed(2),
      tearCount: buildState.tearCount,
      
      // Tipo de lágrima
      tearType: buildState.tearType,
      tearFlags: buildState.tearFlags || [],
      
      // Transformaciones
      transformations: buildState.transformations || [],
      transformationProgress: buildState.transformationProgress || [],
      
      // Rating
      rating: buildState.rating,
      
      // Stats adicionales
      canFly: buildState.canFly,
      speed: buildState.speed?.toFixed(2),
      range: buildState.range?.toFixed(2),
      luck: buildState.luck,
      
      // Efectos on-hit
      onHitEffects: buildState.onHitEffects || [],
    };
  }, [buildState]);
  
  // ═══════════════════════════════════════════════════════════
  // ESTADO DEL LAB
  // ═══════════════════════════════════════════════════════════
  
  const labState = useMemo(() => ({
    isEmpty: selectedItems.length === 0,
    itemCount: selectedItems.length,
    hasTransformations: (buildState?.transformations?.length || 0) > 0,
    hasSpecialTears: buildState?.tearType && buildState.tearType !== 'normal',
    isAnalyzing: analyzeServerMutation.isPending,
    hasServerData: !!buildState?.explanation,
  }), [selectedItems.length, buildState, analyzeServerMutation.isPending]);
  
  return {
    // Contexto base
    ...context,
    
    // Estado calculado
    metrics,
    labState,
    
    // Acciones
    analyzeOnServer,
    getItemImpact,
    previewWithItem,
    previewWithoutItem,
    
    // Loading states
    isAnalyzing: analyzeServerMutation.isPending,
  };
}
