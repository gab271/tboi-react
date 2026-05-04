import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export const fetchBosses = async ({ page = 0, search = '', location = 'all' } = {}) => {
  // Map 0-indexed page to 1-indexed
  const params = new URLSearchParams({
      page: page + 1,
      pageSize: 24
  });

  if (search) params.append('search', search);
  if (location && location !== 'all') params.append('location', location);

  const { data } = await api.get(`/api/bosses?${params.toString()}`);
  return data;
};

export const fetchItems = async ({ page = 0, search = '', type = 'all', ids = [], quality = [] }) => {
  // Map 0-indexed page to 1-indexed
  const params = new URLSearchParams({
    page: page + 1,
    pageSize: ids.length > 0 ? 100 : 24 // If IDs provided, fetch more/all (up to limit)
  });
  
  if (search) params.append('search', search);
  if (type && type !== 'all') params.append('type', type);
  if (ids && ids.length > 0) params.append('ids', ids.join(','));
  if (quality && quality.length > 0) params.append('quality', quality.join(','));

  const { data } = await api.get(`/api/items?${params.toString()}`);
  return data;
};

export const fetchItem = async (id) => {
  const { data } = await api.get(`/api/items/${id}`);
  return data;
};

export const searchEntities = async (q) => {
  const { data } = await api.get(`/api/search?q=${q}`);
  return data;
};

export const fetchRandomItems = async (n = 5) => {
  const { data } = await api.get(`/api/items/random?n=${n}`);
  return data;
};

/**
 * Analyzes an Isaac Repentance save file (V2 Parser)
 * @param {File} file - The save file to analyze
 * @returns {Promise<SaveAnalysisResult>} The parsed save data
 * 
 * V2 Response structure (data at root level, not in 'parsed'):
 * {
 *   ok: boolean,
 *   source: 'real' | 'demo' | 'error',
 *   error_code: string | null,
 *   error_message: string | null,
 *   metadata: { slot, fileHash, parsedAt, parserVersion, ... },
 *   secrets: { count, total, unlockedIds },
 *   items: { count, total, unlockedIds },
 *   trinkets: { count, total, unlockedIds },
 *   characters: { [name]: { marks, completedMarks, percentage, ... } },
 *   endings: { count, total, unlockedIds },
 *   totalMarks: number,
 *   totalMarksExpected: number,
 *   metrics: { deadGodPercentage, marksPercentage, ... },
 *   sanityChecks: { invariantsPassed, warnings, errors },
 *   missing: { secrets, items, marks },
 *   nextSteps: [{ characterName, description, missingMarks }]
 * }
 */
export const analyzeSaveFile = async (file) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1: Read file and calculate SHA-256 hash
  // ═══════════════════════════════════════════════════════════════════════
  
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('[API:analyzeSaveFile] File prepared', {
    name: file.name,
    size: file.size,
    sha256: fileHash.substring(0, 16),
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2: Create FormData with the file
  // ═══════════════════════════════════════════════════════════════════════
  
  const formData = new FormData();
  formData.append('saveFile', file);
  
  // ═══════════════════════════════════════════════════════════════════════
  // STEP 3: Send request with SHA-256 header for verification
  // ═══════════════════════════════════════════════════════════════════════
  
  const response = await fetch(`${BACKEND_URL}/api/save/analyze`, {
    method: 'POST',
    body: formData,
    headers: {
      // Send client-computed hash for server verification
      'X-File-SHA256': fileHash,
      'Cache-Control': 'no-cache, no-store',
      'Pragma': 'no-cache'
    },
    credentials: 'include',
    cache: 'no-store'
  });
  
  const data = await response.json();
  
  console.log('[API:analyzeSaveFile] Response received', {
    ok: data.ok,
    source: data.source,
    requestId: response.headers.get('X-Request-Id'),
    serverHash: data.meta?.sha256?.substring(0, 16) || data.metadata?.sha256?.substring(0, 16),
    hashMatch: (data.meta?.sha256 || data.metadata?.sha256)?.startsWith(fileHash.substring(0, 16))
  });
  
  // Validate response structure
  if (!data || typeof data.ok === 'undefined') {
    throw new Error('Invalid response from server');
  }
  
  // If not ok, throw with the error message
  if (!data.ok) {
    const error = new Error(data.error_message || 'Unknown error');
    error.code = data.error_code;
    error.response = data;
    throw error;
  }
  
  // Attach client hash for verification in UI
  data._clientHash = fileHash;
  
  return data;
};

/**
 * Gets demo/example data for UI preview
 * This should never be shown as real user data
 */
export const fetchDemoSaveData = async () => {
  const { data } = await api.get('/api/save/demo');
  return data;
};

/**
 * Gets daily statistics for live counter
 */
export const fetchDailyStats = async () => {
  const { data } = await api.get('/api/stats/today');
  return data;
};

/**
 * Gets live activity stats for homepage
 */
export const fetchLiveActivity = async () => {
  const { data } = await api.get('/api/activity/live');
  return data;
};

/**
 * Sends heartbeat to track active users
 */
export const sendHeartbeat = async () => {
  const { data } = await api.post('/api/activity/heartbeat');
  return data;
};

/**
 * Gets activity feed
 */
export const fetchActivityFeed = async (limit = 5) => {
  const { data } = await api.get(`/api/activity/feed?limit=${limit}`);
  return data;
};

/**
 * Analyzes synergies for a build
 * @param {number[]} itemIds - Array of item IDs
 * @param {Object} options - Optional character, previous items, etc.
 */
export const analyzeSynergies = async (itemNames) => {
  const { data } = await api.post('/api/synergies/analyze', { itemNames });
  return data;
};

export const contributeSynergy = async ({ itemA, itemB, description }) => {
  const { data } = await api.post('/api/synergies/contribute', { itemA, itemB, description });
  return data;
};

/**
 * Gets items with effects data for synergy engine
 */
export const fetchSynergyItems = async () => {
  const { data } = await api.get('/api/synergies/items');
  return data;
};

/**
 * Gets popular synergies
 */
export const fetchPopularSynergies = async (limit = 10) => {
  const { data } = await api.get(`/api/synergies/popular?limit=${limit}`);
  return data;
};

// ─── User Save Progress ────────────────────────────────────────────────────────

/**
 * Persist the result of a parsed save file for the authenticated user.
 * Maps the UI-transformed object (uiResult from HeroSection) to the
 * shape expected by POST /api/users/:userId/progress.
 *
 * @param {string} userId - Supabase auth user ID
 * @param {string} accessToken - Supabase session access_token
 * @param {object} uiResult - Transformed save analysis result
 */
export const saveUserProgress = async (userId, accessToken, uiResult) => {
  const payload = {
    saveHash: uiResult.sha256Full || uiResult.fileHash || null,
    deadGodPercent: uiResult.percentage ?? 0,
    slot: uiResult.slot ?? 1,
    items: {
      collected: uiResult.itemsFound ?? 0,
      total: uiResult.totalItems ?? 733,
    },
    achievements: {
      unlocked: uiResult.achievementsUnlocked ?? 0,
      total: uiResult.totalAchievements ?? 637,
    },
    characters: Object.fromEntries(
      Object.entries(uiResult.characters || {}).map(([name, c]) => [
        name,
        {
          percentage: c.percentage ?? 0,
          isTainted: c.isTainted ?? false,
          completedMarks: c.completedMarks ?? 0,
        },
      ])
    ),
    summary: {
      endings: { seen: uiResult.endingsSeen ?? 0, total: uiResult.totalEndings ?? 17 },
      completionMarks: uiResult.completionMarks ?? 0,
      totalMarks: uiResult.totalMarks ?? 816,
      vanillaCompleted: uiResult.vanillaCompleted ?? 0,
      taintedCompleted: uiResult.taintedCompleted ?? 0,
      hoursRemaining: uiResult.hoursRemaining ?? null,
    },
  };

  const response = await fetch(`${BACKEND_URL}/api/users/${userId}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save progress');
  }

  return response.json();
};

/**
 * Fetch the user's latest saved progress.
 *
 * @param {string} userId
 * @param {string} accessToken
 */
export const fetchUserProgress = async (userId, accessToken) => {
  const response = await fetch(`${BACKEND_URL}/api/users/${userId}/progress`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch progress');
  }

  return response.json();
};

// ─── Tier List ────────────────────────────────────────────────────────────────

/**
 * Fetch aggregated tier scores for all items.
 * @param {string} character_id  'ALL' or a character slug (e.g. 'the_lost')
 * @param {string} run_type      'normal' | 'greed' | 'greedier' | 'challenge'
 */
export const fetchTierList = async ({ character_id = 'ALL', run_type = 'normal' } = {}) => {
  const { data } = await api.get('/api/tierlist', { params: { character_id, run_type } });
  return data;
};

/**
 * Fetch the authenticated user's own votes.
 * @param {string} accessToken
 * @param {object} filters  Optional { character_id, run_type }
 */
export const fetchMyTierVotes = async (accessToken, { character_id, run_type } = {}) => {
  const params = {};
  if (character_id) params.character_id = character_id;
  if (run_type)     params.run_type     = run_type;

  const { data } = await api.get('/api/tierlist/my-votes', {
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

/**
 * Cast or update a vote for an item.
 * @param {string} accessToken
 * @param {{ item_id: string, tier: string, character_id?: string, run_type?: string }} payload
 */
export const castTierVote = async (accessToken, payload) => {
  const { data } = await api.post('/api/tierlist/vote', payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

/**
 * Remove the authenticated user's vote for an item.
 * @param {string} accessToken
 * @param {{ item_id: string, character_id?: string, run_type?: string }} payload
 */
export const removeTierVote = async (accessToken, payload) => {
  const { data } = await api.delete('/api/tierlist/vote', {
    data: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
};

export default api;
