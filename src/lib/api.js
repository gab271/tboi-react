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

export const fetchBosses = async (page = 0) => {
  // Map 0-indexed page to 1-indexed
  const { data } = await api.get(`/api/bosses?page=${page + 1}`);
  // Our new API returns { data: [...], meta: ... }. The component expects an array or { bosses: [] }
  // We return the array directly to satisfy Array.isArray(data) check in components
  return data.data || [];
};

export const fetchItems = async (page = 0) => {
  // Map 0-indexed page to 1-indexed
  const { data } = await api.get(`/api/items?page=${page + 1}`);
  return data.data || [];
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


