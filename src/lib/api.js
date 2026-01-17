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

export const fetchItems = async ({ page = 0, search = '', type = 'all', ids = [] }) => {
  // Map 0-indexed page to 1-indexed
  const params = new URLSearchParams({
    page: page + 1,
    pageSize: ids.length > 0 ? 100 : 24 // If IDs provided, fetch more/all (up to limit)
  });
  
  if (search) params.append('search', search);
  if (type && type !== 'all') params.append('type', type);
  if (ids && ids.length > 0) params.append('ids', ids.join(','));

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

export default api;


