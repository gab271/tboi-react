/**
 * Collection Lab API
 * Funciones de API para el Laboratorio Estratégico
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

/**
 * Fetch items con paginación para infinite scroll
 */
export async function fetchItemsPage({ page = 1, pageSize = 48, type, quality, search }) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  
  if (search) params.append('search', search);
  if (type && type !== 'all') params.append('type', type);
  if (quality && quality.length > 0) params.append('quality', quality.join(','));
  
  const response = await fetch(`${BACKEND_URL}/api/items?${params.toString()}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  
  return response.json();
}

/**
 * Fetch items con efectos estructurados (para el motor de sinergias)
 */
export async function fetchItemsWithEffects() {
  const response = await fetch(`${BACKEND_URL}/api/synergies/items`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch items with effects');
  }
  
  const data = await response.json();
  return data.items || [];
}

/**
 * Fetch efectos de un item específico
 */
export async function fetchItemEffects(itemId) {
  const response = await fetch(`${BACKEND_URL}/api/synergies/items/${itemId}/effects`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    // Fallback: devolver item sin efectos especiales
    return { id: itemId, effects: null };
  }
  
  return response.json();
}

/**
 * Analiza una build en el servidor
 */
export async function analyzeBuild(itemIds, characterId = null) {
  const response = await fetch(`${BACKEND_URL}/api/synergies/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ itemIds, characterId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze build');
  }
  
  return response.json();
}

/**
 * Obtiene estadísticas globales de un item
 */
export async function fetchItemGlobalStats(itemId) {
  const response = await fetch(`${BACKEND_URL}/api/items/${itemId}/stats`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}

/**
 * Obtiene el progreso del usuario con items
 */
export async function fetchUserItemProgress(userId) {
  const response = await fetch(`${BACKEND_URL}/api/users/${userId}/item-progress`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    // Si no hay progreso, devolver objeto vacío
    return { items: {}, totalItems: 700 };
  }
  
  return response.json();
}

/**
 * Actualiza el progreso de un item
 */
export async function updateItemProgress(userId, itemId, action) {
  const response = await fetch(`${BACKEND_URL}/api/users/${userId}/item-progress/${itemId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ action }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update item progress');
  }
  
  return response.json();
}

/**
 * Obtiene items desbloqueables según el progreso actual
 */
export async function fetchUnlockableItems(userId) {
  const response = await fetch(`${BACKEND_URL}/api/users/${userId}/unlockable-items`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    return { items: [] };
  }
  
  return response.json();
}

/**
 * Compara dos items
 */
export async function compareItemsOnServer(itemIdA, itemIdB, currentBuildIds = []) {
  const response = await fetch(`${BACKEND_URL}/api/synergies/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ itemIdA, itemIdB, currentBuildIds }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to compare items');
  }
  
  return response.json();
}

/**
 * Obtiene transformaciones disponibles
 */
export async function fetchTransformations() {
  const response = await fetch(`${BACKEND_URL}/api/synergies/transformations`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch transformations');
  }
  
  return response.json();
}
