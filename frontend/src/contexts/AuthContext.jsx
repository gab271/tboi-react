import { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';

export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Guard to prevent double-firing in StrictMode
  const authListenerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 1. Initial Session Load
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
    
    // Only fetch session if not already loading (optimization not really applicable here as effect runs on mount)
    initAuth();

    // 2. Event Listener logic with duplicate prevention
    if (!authListenerRef.current) {
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
        authListenerRef.current = subscription;
    }

    // Cleanup
    return () => {
      mounted = false;
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
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
