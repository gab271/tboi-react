import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        Authorization: `Bearer ${session?.access_token}`
    };
};

export const adminService = {
    getStats: async () => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_URL}/admin/stats`, { headers });
        return response.data;
    },
    
    promoteUser: async (userId) => {
        const headers = await getHeaders();
        const response = await axios.post(`${API_URL}/admin/promote`, { userId }, { headers });
        return response.data;
    },

    getUsers: async () => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_URL}/admin/users`, { headers });
        return response.data; // { users: [...] }
    },

    deleteUser: async (userId) => {
        const headers = await getHeaders();
        const response = await axios.delete(`${API_URL}/admin/users/${userId}`, { headers });
        return response.data;
    }
};
