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
  const { data } = await api.get(`/api/isaac/bosses?page=${page}`);
  return data;
};

export const fetchItems = async (page = 0) => {
  const { data } = await api.get(`/api/isaac/items?page=${page}`);
  return data;
};

export const searchEntities = async (q) => {
  const { data } = await api.get(`/api/search?q=${q}`);
  return data;
};

export default api;
