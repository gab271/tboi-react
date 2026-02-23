/**
 * Activity Display Utility
 * Genera textos de actividad que siempre se sienten vivos
 * Regla: NUNCA mentir, pero SIEMPRE contextualizar positivamente
 */

/**
 * Formato de tiempo relativo optimizado para engagement
 */
export function formatTimeAgo(timestamp) {
  if (!timestamp) return null;
  
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'hace un momento';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
  if (seconds < 172800) return 'ayer';
  return `hace ${Math.floor(seconds / 86400)} días`;
}

/**
 * Genera textos de actividad basados en stats reales
 * @param {Object} stats - Estadísticas del backend
 * @returns {Array<string>} Textos para mostrar (rotar)
 */
export function getActivityTexts(stats) {
  if (!stats) return ['Cargando actividad...'];
  
  const { 
    savesToday = 0, 
    buildsToday = 0, 
    usersActive = 0, 
    lastBuildAt, 
    lastSaveAt 
  } = stats;

  const texts = [];

  // === USUARIOS ACTIVOS ===
  if (usersActive >= 10) {
    texts.push(`${usersActive} jugadores explorando ahora`);
  } else if (usersActive >= 3) {
    texts.push(`${usersActive} jugadores activos`);
  } else if (usersActive === 1) {
    texts.push(`1 jugador conectado`);
  } else if (usersActive === 0) {
    // 0 activos - mostrar última actividad en su lugar
    const lastActivity = Math.max(lastBuildAt || 0, lastSaveAt || 0);
    if (lastActivity) {
      texts.push(`Última actividad ${formatTimeAgo(lastActivity)}`);
    }
  }

  // === SAVES ANALIZADOS ===
  if (savesToday >= 50) {
    texts.push(`${savesToday} saves analizados hoy`);
  } else if (savesToday >= 10) {
    texts.push(`${savesToday} jugadores midieron su progreso hoy`);
  } else if (savesToday >= 1) {
    texts.push(`${savesToday} ${savesToday === 1 ? 'save analizado' : 'saves analizados'} hoy`);
  } else {
    texts.push(`Sé el primero en analizar tu save hoy`);
  }

  // === BUILDS ===
  if (buildsToday >= 5) {
    texts.push(`${buildsToday} builds compartidas hoy`);
  } else if (buildsToday >= 1) {
    const ago = formatTimeAgo(lastBuildAt);
    if (ago) {
      texts.push(`Última build compartida ${ago}`);
    }
  } else {
    texts.push(`Nadie ha compartido build hoy — sé el primero`);
  }

  // Asegurar al menos un texto
  if (texts.length === 0) {
    texts.push('Comunidad activa de Isaac');
  }

  return texts;
}

/**
 * Genera un solo texto de actividad (para espacios pequeños)
 */
export function getSingleActivityText(stats) {
  const texts = getActivityTexts(stats);
  // Priorizar usuarios activos, luego saves
  return texts[0] || 'Comunidad de Isaac';
}

/**
 * Genera estadísticas para mostrar en hero/dashboard
 */
export function getHeroStats(stats) {
  if (!stats) return [];
  
  const result = [];
  
  if (stats.usersActive > 0) {
    result.push({
      value: stats.usersActive,
      label: 'activos ahora',
      icon: 'users'
    });
  }
  
  if (stats.savesToday > 0) {
    result.push({
      value: stats.savesToday,
      label: 'saves hoy',
      icon: 'chart'
    });
  }
  
  if (stats.buildsToday > 0) {
    result.push({
      value: stats.buildsToday,
      label: 'builds hoy',
      icon: 'builds'
    });
  }
  
  return result;
}
