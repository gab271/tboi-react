/**
 * Activity Display Utility
 * Genera textos de actividad que siempre se sienten vivos
 * Regla: NUNCA mentir, pero SIEMPRE contextualizar positivamente
 */

/**
 * Formato de tiempo relativo optimizado para engagement
 * @param {number} timestamp - Unix timestamp
 * @param {Function} t - i18n translation function
 * @returns {string} Relative time string
 */
export function formatTimeAgo(timestamp, t) {
  if (!timestamp) return null;
  
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (t) {
    if (seconds < 60) return t('activity.justNow');
    if (seconds < 3600) return t('activity.minutesAgo', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('activity.hoursAgo', { count: Math.floor(seconds / 3600) });
    if (seconds < 172800) return t('activity.yesterday');
    return t('activity.daysAgo', { count: Math.floor(seconds / 86400) });
  }
  
  // Fallback without translation
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return 'yesterday';
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Genera textos de actividad basados en stats reales
 * @param {Object} stats - Estadísticas del backend
 * @param {Function} t - i18n translation function
 * @returns {Array<string>} Textos para mostrar (rotar)
 */
export function getActivityTexts(stats, t) {
  if (!stats) return [t ? t('activity.loadingActivity') : 'Loading activity...'];
  
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
    texts.push(t ? t('activity.playersExploring', { count: usersActive }) : `${usersActive} players exploring now`);
  } else if (usersActive >= 3) {
    texts.push(t ? t('activity.playersActive', { count: usersActive }) : `${usersActive} active players`);
  } else if (usersActive === 1) {
    texts.push(t ? t('activity.onePlayerConnected') : '1 player connected');
  } else if (usersActive === 0) {
    // 0 activos - mostrar última actividad en su lugar
    const lastActivity = Math.max(lastBuildAt || 0, lastSaveAt || 0);
    if (lastActivity) {
      const timeAgo = formatTimeAgo(lastActivity, t);
      texts.push(t ? t('activity.lastActivity', { time: timeAgo }) : `Last activity ${timeAgo}`);
    }
  }

  // === SAVES ANALIZADOS ===
  if (savesToday >= 50) {
    texts.push(t ? t('activity.savesAnalyzedToday', { count: savesToday }) : `${savesToday} saves analyzed today`);
  } else if (savesToday >= 10) {
    texts.push(t ? t('activity.playersMeasuredProgress', { count: savesToday }) : `${savesToday} players measured their progress today`);
  } else if (savesToday >= 1) {
    texts.push(t ? t('activity.savesAnalyzedTodayCount', { count: savesToday }) : `${savesToday} ${savesToday === 1 ? 'save analyzed' : 'saves analyzed'} today`);
  } else {
    texts.push(t ? t('activity.beFirstToAnalyze') : 'Be the first to analyze your save today');
  }

  // === BUILDS ===
  if (buildsToday >= 5) {
    texts.push(t ? t('activity.buildsSharedToday', { count: buildsToday }) : `${buildsToday} builds shared today`);
  } else if (buildsToday >= 1) {
    const ago = formatTimeAgo(lastBuildAt, t);
    if (ago) {
      texts.push(t ? t('activity.lastBuildShared', { time: ago }) : `Last build shared ${ago}`);
    }
  } else {
    texts.push(t ? t('activity.noBuildsToday') : 'No one has shared a build today — be the first');
  }

  // Asegurar al menos un texto
  if (texts.length === 0) {
    texts.push(t ? t('activity.activeCommunity') : 'Active Isaac community');
  }

  return texts;
}

/**
 * Genera un solo texto de actividad (para espacios pequeños)
 * @param {Object} stats - Estadísticas del backend  
 * @param {Function} t - i18n translation function
 */
export function getSingleActivityText(stats, t) {
  const texts = getActivityTexts(stats, t);
  // Priorizar usuarios activos, luego saves
  return texts[0] || (t ? t('activity.isaacCommunity') : 'Isaac Community');
}

/**
 * Genera estadísticas para mostrar en hero/dashboard
 * @param {Object} stats - Estadísticas del backend
 * @param {Function} t - i18n translation function
 */
export function getHeroStats(stats, t) {
  if (!stats) return [];
  
  const result = [];
  
  if (stats.usersActive > 0) {
    result.push({
      value: stats.usersActive,
      label: t ? t('activity.activeNow') : 'active now',
      icon: 'users'
    });
  }
  
  if (stats.savesToday > 0) {
    result.push({
      value: stats.savesToday,
      label: t ? t('activity.savesToday') : 'saves today',
      icon: 'chart'
    });
  }
  
  if (stats.buildsToday > 0) {
    result.push({
      value: stats.buildsToday,
      label: t ? t('activity.buildsToday') : 'builds today',
      icon: 'builds'
    });
  }
  
  return result;
}
