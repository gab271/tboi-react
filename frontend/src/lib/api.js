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
 * Analyzes an Isaac Repentance save file
 * @param {File} file - The save file to analyze
 * @returns {Promise<SaveAnalysisResult>} The parsed save data
 * 
 * Response structure:
 * {
 *   ok: boolean,
 *   source: 'real' | 'demo' | 'error',
 *   error_code: string | null,
 *   error_message: string | null,
 *   parsed: { ... } | null,
 *   metrics: { ... } | null
 * }
 */
export const analyzeSaveFile = async (file) => {
  const formData = new FormData();
  formData.append('saveFile', file);
  
  // Use fetch directly to avoid axios cache issues
  const response = await fetch(`${BACKEND_URL}/api/save/analyze`, {
    method: 'POST',
    body: formData,
    // DON'T set Content-Type - browser will set multipart boundary automatically
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    },
    credentials: 'include',
    cache: 'no-store' // Prevent fetch caching
  });
  
  const data = await response.json();
  
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

export default api;


