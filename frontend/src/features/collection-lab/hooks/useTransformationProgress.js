/**
 * useTransformationProgress
 * Paso 2: Calcula el progreso hacia cada transformación
 * a partir del array de IDs numéricos coleccionados por el jugador.
 */
import { useMemo } from 'react';
import { TRANSFORMATION_POOLS, ITEM_TO_TRANSFORMATIONS } from '../data/transformations';
import { TRANSFORMATION_INFO, TRANSFORMATION_THRESHOLDS } from '../lib/effectCalculator';

/**
 * @param {number[]} collectedItemIds - IDs numéricos de Isaac de los ítems que el jugador tiene
 * @returns {TransformationEntry[]} Array ordenado: completas primero, luego por progreso desc.
 *
 * @typedef {Object} TransformationEntry
 * @property {string}   key          - Key de la transformación (ej: 'guppy')
 * @property {Object}   info         - { name, icon, color, description } de effectCalculator
 * @property {number}   current      - Ítems coleccionados que cuentan (capped al threshold)
 * @property {number}   threshold    - Ítems necesarios para completar (generalmente 3)
 * @property {boolean}  complete     - true si current >= threshold
 * @property {number[]} collectedIds - Qué IDs específicos del pool tiene el jugador
 */
export function useTransformationProgress(collectedItemIds = []) {
  return useMemo(() => {
    const counts = {};
    const matched = {};

    // Una sola pasada sobre la colección — O(n) gracias al Map
    for (const id of collectedItemIds) {
      const keys = ITEM_TO_TRANSFORMATIONS.get(id);
      if (!keys) continue;
      for (const key of keys) {
        counts[key] = (counts[key] ?? 0) + 1;
        (matched[key] ??= []).push(id);
      }
    }

    return Object.keys(TRANSFORMATION_POOLS)
      .map(key => {
        const threshold = TRANSFORMATION_THRESHOLDS[key] ?? 3;
        const raw = counts[key] ?? 0;
        const current = Math.min(raw, threshold); // 5/3 → muestra 3/3
        return {
          key,
          info: TRANSFORMATION_INFO[key] ?? { name: key, icon: '❓', color: '#888', description: '' },
          current,
          threshold,
          complete: current >= threshold,
          collectedIds: matched[key] ?? [],
        };
      })
      .sort((a, b) => {
        if (b.complete !== a.complete) return Number(b.complete) - Number(a.complete);
        if (b.current !== a.current) return b.current - a.current;
        return a.key.localeCompare(b.key);
      });
  }, [collectedItemIds]);
}
