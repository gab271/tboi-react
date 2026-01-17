import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Load
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await authService.getSession();
        if (mounted) {
            if (error) {
                console.error("[AuthProvider] Error loading session:", error);
            }
            setSession(initialSession);
            setUser(initialSession?.user ?? null);
        }
      } catch (err) {
        console.error("[AuthProvider] Unexpected error loading session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 2. Event Listener
    // In strict mode (dev), effects run twice. We use a global flag to warn/debug,
    // though Supabase's returns a subscription object that handles unique listeners well if unsubscribed correctly.
    if (import.meta.env.DEV && window.__auth_listener_attached) {
       console.warn('[AuthProvider] Listener already attached. This is expected in React StrictMode but ensure it is cleaned up.');
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (import.meta.env.DEV) {
           console.debug(`[AuthProvider] onAuthStateChange: ${event}`, { 
               userId: currentSession?.user?.id,
               timestamp: new Date().toISOString()
           });
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    if (import.meta.env.DEV) {
        window.__auth_listener_attached = true;
    }

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (import.meta.env.DEV) {
          window.__auth_listener_attached = false;
      }
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    // Expose service methods directly through context
    signIn: authService.signInWithPassword,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPasswordForEmail: authService.sendPasswordReset,
    updatePassword: authService.updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
