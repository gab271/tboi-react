/**
 * THE COLLECTION LAB - Exportaciones principales
 * Sistema de Laboratorio Estratégico Premium para TBOI
 */

// Página principal
export { CollectionLab } from './CollectionLab';

// Componentes Build Lab
export { BuildLabBar } from './components/BuildLabBar';
export { BuildStatsPanel } from './components/BuildStatsPanel';
export { BuildItemSlot } from './components/BuildItemSlot';

// Componentes Collection
export { LabItemCard } from './components/LabItemCard';
export { LabItemGrid } from './components/LabItemGrid';
export { ItemHoverCard } from './components/ItemHoverCard';
export { ItemProgressOverlay } from './components/ItemProgressOverlay';

// Filtros
export { AdvancedFilters } from './components/AdvancedFilters';
export { SmartFilterBar } from './components/SmartFilterBar';

// Comparación y Stats
export { ItemCompareModal } from './components/ItemCompareModal';
export { GlobalStatsPanel } from './components/GlobalStatsPanel';

// Hooks
export { useBuildLab } from './hooks/useBuildLab';
export { useItemEffects } from './hooks/useItemEffects';
export { useUserItemProgress } from './hooks/useUserItemProgress';
export { useInfiniteItems } from './hooks/useInfiniteItems';

// Contexto
export { BuildLabProvider, useBuildLabContext } from './context/BuildLabContext';

// Utilidades
export * from './lib/effectCalculator';
export * from './lib/filterEngine';
