/**
 * Activity Tracking System
 * Registra eventos de usuario para métricas reales
 */

const express = require('express');
const supabase = require('../lib/supabaseAdmin');

const router = express.Router();

// Cache en memoria para stats (evitar queries frecuentes)
let statsCache = {
  data: null,
  lastUpdate: 0,
  ttl: 30000 // 30 segundos
};

/**
 * Registra un evento de actividad
 * @param {string} eventType - Tipo de evento
 * @param {string|null} userId - ID del usuario (null si anónimo)
 * @param {Object} metadata - Datos adicionales
 */
async function logActivity(eventType, userId = null, metadata = {}) {
  try {
    // No bloquear por errores de logging
    await supabase.from('activity_log').insert({
      event_type: eventType,
      user_id: userId,
      metadata,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ACTIVITY] Error logging:', error.message);
  }
}

/**
 * GET /api/activity/live
 * Obtiene estadísticas en vivo para mostrar actividad
 */
router.get('/live', async (req, res) => {
  try {
    const now = Date.now();
    
    // Usar cache si es reciente
    if (statsCache.data && (now - statsCache.lastUpdate) < statsCache.ttl) {
      return res.json({ ok: true, stats: statsCache.data, cached: true });
    }
    
    // Query directo (sin vista materializada por simplicidad inicial)
    const now24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const now15m = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    // Saves analizados hoy
    const { count: savesToday } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'save_analyzed')
      .gte('created_at', now24h);
    
    // Builds compartidas hoy
    const { count: buildsToday } = await supabase
      .from('activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'build_created')
      .gte('created_at', now24h);
    
    // Usuarios activos (últimos 15 min)
    const { data: activeData } = await supabase
      .from('activity_log')
      .select('user_id')
      .gte('created_at', now15m);
    
    const uniqueUsers = new Set(activeData?.map(d => d.user_id).filter(Boolean));
    const usersActive = uniqueUsers.size;
    
    // Última actividad
    const { data: lastBuild } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('event_type', 'build_created')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const { data: lastSave } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('event_type', 'save_analyzed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    const stats = {
      savesToday: savesToday || 0,
      buildsToday: buildsToday || 0,
      usersActive: usersActive || 0,
      lastBuildAt: lastBuild?.created_at ? new Date(lastBuild.created_at).getTime() : null,
      lastSaveAt: lastSave?.created_at ? new Date(lastSave.created_at).getTime() : null,
      synergiesChecked: 0, // TODO: trackear
    };
    
    // Actualizar cache
    statsCache = {
      data: stats,
      lastUpdate: now,
      ttl: 30000
    };
    
    res.json({ ok: true, stats, cached: false });
    
  } catch (error) {
    console.error('[ACTIVITY] Error getting stats:', error);
    
    // Devolver defaults si falla
    res.json({
      ok: true,
      stats: {
        savesToday: 0,
        buildsToday: 0,
        usersActive: 0,
        lastBuildAt: null,
        lastSaveAt: null,
      },
      error: 'Using defaults'
    });
  }
});

/**
 * POST /api/activity/heartbeat
 * Registra que un usuario sigue activo
 */
router.post('/heartbeat', async (req, res) => {
  const userId = req.user?.id || null;
  await logActivity('session_heartbeat', userId, {
    page: req.body.page,
    sessionId: req.body.sessionId
  });
  res.json({ ok: true });
});

/**
 * GET /api/activity/feed
 * Feed de actividad reciente (para mostrar en la home)
 */
router.get('/feed', async (req, res) => {
  try {
    const { data } = await supabase
      .from('activity_log')
      .select(`
        id,
        event_type,
        metadata,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .in('event_type', ['build_created', 'achievement_unlocked', 'dead_god_reached'])
      .order('created_at', { ascending: false })
      .limit(10);
    
    const feed = (data || []).map(item => ({
      id: item.id,
      type: item.event_type,
      user: item.profiles?.username || 'Anónimo',
      avatar: item.profiles?.avatar_url,
      metadata: item.metadata,
      timestamp: item.created_at
    }));
    
    res.json({ ok: true, feed });
    
  } catch (error) {
    console.error('[ACTIVITY] Error getting feed:', error);
    res.json({ ok: true, feed: [] });
  }
});

// Eventos disponibles
const TRACKABLE_EVENTS = {
  SAVE_ANALYZED: 'save_analyzed',
  BUILD_CREATED: 'build_created',
  BUILD_VOTED: 'build_voted',
  COMMENT_POSTED: 'comment_posted',
  ITEM_FAVORITED: 'item_favorited',
  SYNERGY_CHECKED: 'synergy_checked',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  CHARACTER_COMPLETED: 'character_completed',
  DEAD_GOD_REACHED: 'dead_god_reached',
  SESSION_START: 'session_start',
  SESSION_HEARTBEAT: 'session_heartbeat',
};

module.exports = router;
module.exports.logActivity = logActivity;
module.exports.TRACKABLE_EVENTS = TRACKABLE_EVENTS;
