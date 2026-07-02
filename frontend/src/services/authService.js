import { supabase } from '../lib/supabaseClient';

/**
 * AuthService
 * Wrapper around Supabase Auth to provide logging, instrumentation,
 * and centralized error handling.
 */

const LOG_TAG = '[AuthService]';

// Helper to log in development only
const log = (action, _details = {}) => {
  if (import.meta.env.DEV) {
    console.debug(`[AUTH_CALL] ${action}`, new Date().toISOString());
    console.debug(new Error().stack);
  }
};

export const authService = {
  /**
   * Login with email and password
   */
  async signInWithPassword(email, password) {
    log('signInWithPassword called', { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`${LOG_TAG} Error during signIn:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Sign up with email and password
   */
  async signUp(email, password, metadata = {}) {
    log('signUp called', { email });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      console.error(`${LOG_TAG} Error during signUp:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Sign out current user
   */
  async signOut() {
    log('signOut called');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(`${LOG_TAG} Error during signOut:`, error);
      return { error };
    }
    return { error: null };
  },

  /**
   * Send password reset email
   * CAUTION: Triggers email. Should only be called on explicit user action.
   */
  async sendPasswordReset(email) {
    log('sendPasswordReset called', { email });
    const redirectTo = `${window.location.origin}/reset-password`; // Debe coincidir con la ruta en App.jsx

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error(`${LOG_TAG} Error sending reset email:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Update user details (e.g. password recovery)
   */
  async updatePassword(newPassword) {
    log('updatePassword called');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(`${LOG_TAG} Error updating password:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  },

  /**
   * Get current session (no network call if cached, usually)
   */
  async getSession() {
    log('getSession called');
    return await supabase.auth.getSession();
  },

  /**
   * Get current user
   */
  async getUser() {
    log('getUser called');
    return await supabase.auth.getUser();
  },
};
