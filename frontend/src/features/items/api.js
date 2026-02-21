import axios from 'axios';
import { api } from '@/lib/api'; // The axios instance pointing to Node Backend

// For Edge Functions, we construct the URL based on Supabase config or a specific ENV
// Assuming standard Supabase Functions URL structure or a separate env
// If not provided, we fallback to a relative path or the backend if you prefer proxying
const SUPABASE_PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_REF;
const EDGE_FUNCTION_URL = SUPABASE_PROJECT_REF 
  ? `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/codex-items`
  : 'http://localhost:54321/functions/v1/codex-items'; // Local dev default

// Create specific instance for Edge Function (Read-only public mostly)
const edgeApi = axios.create({
  baseURL: EDGE_FUNCTION_URL,
  timeout: 10000,
});

/**
 * READ Operations (Edge Function)
 */
export const getItems = async ({ page = 1, pageSize = 24, type = null, signal }) => {
  const params = { page, pageSize };
  if (type) params.type = type;
  
  // Direct call to Edge Function
  const response = await edgeApi.get('/', { params, signal });
  return response.data;
};

export const getItemBySlug = async (slug) => {
  const response = await edgeApi.get(`/${slug}`);
  return response.data;
};

export const searchItems = async (query) => {
  const response = await edgeApi.get('/search', { params: { q: query } });
  return response.data;
};

export const getRandomItems = async (n = 3) => {
  const response = await edgeApi.get('/random', { params: { n } });
  return response.data;
};

/**
 * WRITE/ADMIN Operations (Node Backend)
 */

// Upload image and update item
// POST /api/admin/items/:externalId/image
export const uploadItemImage = async (externalId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post(`/api/admin/items/${externalId}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// You can add other admin CRUD here calling the Node Backend
// export const createItem = ...
