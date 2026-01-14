import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const BASE_URL = 'https://isaac.jamesmcfadden.co.uk/api/v1';
const PROXY_URL = 'https://corsproxy.io/?' + encodeURIComponent(BASE_URL); 
// Note: Direct CORS might fail, using corsproxy for demo reliability or handled via mocks.
// For production, a server-side proxy is better.

export async function fetcher(endpoint) {
  // Using a fallback for CORS issues common with this specific API
  try {
     const res = await fetch(`${BASE_URL}${endpoint}`);
     if (!res.ok) throw new Error('API Error');
     return await res.json();
  } catch (err) {
      console.warn("Direct fetch failed, trying proxy/mock fallback", err);
      // Simple fallback or mock logic could go here
      throw err;
  }
}
