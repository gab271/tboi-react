/**
 * Build Lab Context
 * Estado global para el modo Build Lab del Laboratorio Estratégico
 */
import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { useFeatures } from '../../../hooks/useFeatures';

const BuildLabContext = createContext(null);

// Estado inicial del Build Lab
const initialState = {
  // Modo activo
  mode: 'collection', // 'collection' | 'buildlab' | 'compare'
  
  // Items en el Build Lab
  selectedItems: [],
  
  // Items para comparar (máx 2)
  compareItems: [],
  
  // Estado calculado de la build
  buildState: null,
  
  // Historial de cambios (para undo)
  history: [],
  
  // Filtros activos
  filters: {
    type: 'all',
    quality: [],
    smart: [], // Filtros inteligentes activos
  },
  
  // Configuración
  settings: {
    showProgress: true,
    showEffects: true,
    autoCalculate: true,
  }
};

// Acciones del reducer
const actions = {
  SET_MODE: 'SET_MODE',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_BUILD: 'CLEAR_BUILD',
  SET_BUILD_STATE: 'SET_BUILD_STATE',
  SET_COMPARE_ITEMS: 'SET_COMPARE_ITEMS',
  SET_FILTERS: 'SET_FILTERS',
  SET_SMART_FILTER: 'SET_SMART_FILTER',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  UNDO: 'UNDO',
  REORDER_ITEMS: 'REORDER_ITEMS',
};

function buildLabReducer(state, action) {
  switch (action.type) {
    case actions.SET_MODE:
      return { ...state, mode: action.payload };
      
    case actions.ADD_ITEM: {
      // Verificar si ya está en la lista
      if (state.selectedItems.find(i => i.id === action.payload.id)) {
        return state;
      }
      
      const newItems = [...state.selectedItems, action.payload];
      return {
        ...state,
        selectedItems: newItems,
        history: [...state.history.slice(-9), { items: state.selectedItems }]
      };
    }
    
    case actions.REMOVE_ITEM: {
      const newItems = state.selectedItems.filter(i => i.id !== action.payload);
      return {
        ...state,
        selectedItems: newItems,
        history: [...state.history.slice(-9), { items: state.selectedItems }]
      };
    }
    
    case actions.CLEAR_BUILD:
      return {
        ...state,
        selectedItems: [],
        buildState: null,
        history: [...state.history.slice(-9), { items: state.selectedItems }]
      };
      
    case actions.SET_BUILD_STATE:
      return { ...state, buildState: action.payload };
      
    case actions.SET_COMPARE_ITEMS:
      return { 
        ...state, 
        compareItems: action.payload.slice(0, 2),
        mode: action.payload.length === 2 ? 'compare' : state.mode
      };
      
    case actions.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    case actions.SET_SMART_FILTER: {
      const { filter, active } = action.payload;
      const currentFilters = state.filters.smart || [];
      const newFilters = active
        ? [...currentFilters.filter(f => f !== filter), filter]
        : currentFilters.filter(f => f !== filter);
      return { 
        ...state, 
        filters: { ...state.filters, smart: newFilters }
      };
    }
    
    case actions.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
      
    case actions.UNDO: {
      const lastState = state.history[state.history.length - 1];
      if (!lastState) return state;
      return {
        ...state,
        selectedItems: lastState.items,
        history: state.history.slice(0, -1)
      };
    }
    
    case actions.REORDER_ITEMS:
      return { ...state, selectedItems: action.payload };
      
    default:
      return state;
  }
}

export function BuildLabProvider({ children }) {
  const [state, dispatch] = useReducer(buildLabReducer, initialState);
  const { isPro, hasFeature } = useFeatures();
  
  // Límite de items según tier
  const itemLimit = useMemo(() => {
    return isPro ? Infinity : 5;
  }, [isPro]);
  
  // ═══════════════════════════════════════════════════════════
  // ACCIONES
  // ═══════════════════════════════════════════════════════════
  
  const setMode = useCallback((mode) => {
    dispatch({ type: actions.SET_MODE, payload: mode });
  }, []);
  
  const addItem = useCallback((item) => {
    // Verificar límite
    if (state.selectedItems.length >= itemLimit) {
      return { success: false, reason: 'limit_reached', limit: itemLimit };
    }
    dispatch({ type: actions.ADD_ITEM, payload: item });
    return { success: true };
  }, [state.selectedItems.length, itemLimit]);
  
  const removeItem = useCallback((itemId) => {
    dispatch({ type: actions.REMOVE_ITEM, payload: itemId });
  }, []);
  
  const clearBuild = useCallback(() => {
    dispatch({ type: actions.CLEAR_BUILD });
  }, []);
  
  const setBuildState = useCallback((buildState) => {
    dispatch({ type: actions.SET_BUILD_STATE, payload: buildState });
  }, []);
  
  const toggleCompareItem = useCallback((item) => {
    const isSelected = state.compareItems.find(i => i.id === item.id);
    if (isSelected) {
      dispatch({ 
        type: actions.SET_COMPARE_ITEMS, 
        payload: state.compareItems.filter(i => i.id !== item.id) 
      });
    } else if (state.compareItems.length < 2) {
      dispatch({ 
        type: actions.SET_COMPARE_ITEMS, 
        payload: [...state.compareItems, item] 
      });
    }
  }, [state.compareItems]);
  
  const clearCompare = useCallback(() => {
    dispatch({ type: actions.SET_COMPARE_ITEMS, payload: [] });
    dispatch({ type: actions.SET_MODE, payload: 'collection' });
  }, []);
  
  const setFilters = useCallback((filters) => {
    dispatch({ type: actions.SET_FILTERS, payload: filters });
  }, []);
  
  const toggleSmartFilter = useCallback((filter) => {
    const isActive = state.filters.smart?.includes(filter);
    dispatch({ 
      type: actions.SET_SMART_FILTER, 
      payload: { filter, active: !isActive }
    });
  }, [state.filters.smart]);
  
  const updateSettings = useCallback((settings) => {
    dispatch({ type: actions.UPDATE_SETTINGS, payload: settings });
  }, []);
  
  const undo = useCallback(() => {
    dispatch({ type: actions.UNDO });
  }, []);
  
  const reorderItems = useCallback((items) => {
    dispatch({ type: actions.REORDER_ITEMS, payload: items });
  }, []);
  
  // ═══════════════════════════════════════════════════════════
  // ESTADOS DERIVADOS
  // ═══════════════════════════════════════════════════════════
  
  const canAddMoreItems = useMemo(() => {
    return state.selectedItems.length < itemLimit;
  }, [state.selectedItems.length, itemLimit]);
  
  const isItemSelected = useCallback((itemId) => {
    return state.selectedItems.some(i => i.id === itemId);
  }, [state.selectedItems]);
  
  const isItemInCompare = useCallback((itemId) => {
    return state.compareItems.some(i => i.id === itemId);
  }, [state.compareItems]);
  
  const canUndo = state.history.length > 0;
  
  // ═══════════════════════════════════════════════════════════
  // VALOR DEL CONTEXTO
  // ═══════════════════════════════════════════════════════════
  
  const value = useMemo(() => ({
    // Estado
    ...state,
    itemLimit,
    canAddMoreItems,
    canUndo,
    
    // Acciones
    setMode,
    addItem,
    removeItem,
    clearBuild,
    setBuildState,
    toggleCompareItem,
    clearCompare,
    setFilters,
    toggleSmartFilter,
    updateSettings,
    undo,
    reorderItems,
    
    // Helpers
    isItemSelected,
    isItemInCompare,
  }), [
    state,
    itemLimit,
    canAddMoreItems,
    canUndo,
    setMode,
    addItem,
    removeItem,
    clearBuild,
    setBuildState,
    toggleCompareItem,
    clearCompare,
    setFilters,
    toggleSmartFilter,
    updateSettings,
    undo,
    reorderItems,
    isItemSelected,
    isItemInCompare,
  ]);
  
  return (
    <BuildLabContext.Provider value={value}>
      {children}
    </BuildLabContext.Provider>
  );
}

export function useBuildLabContext() {
  const context = useContext(BuildLabContext);
  if (!context) {
    throw new Error('useBuildLabContext must be used within BuildLabProvider');
  }
  return context;
}
