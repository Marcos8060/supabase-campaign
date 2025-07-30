'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase/client';
import { profileQueries } from '@/app/lib/supabase/queries';
import type { Profile, AuthUser } from '@/app/types/database';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName?: string, organization?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Get or create profile
      const { data: profile, error } = await profileQueries.getProfile(authUser.id);
      
      if (error && error.includes('No rows found')) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await profileQueries.createProfile({
          id: authUser.id,
          email: authUser.email!,
          role: 'user',
          full_name: authUser.user_metadata?.full_name,
          organization: authUser.user_metadata?.organization,
        });

        if (createError) {
          console.error('Error creating profile:', createError);
          setUser({
            id: authUser.id,
            email: authUser.email!,
            role: 'user',
          });
        } else {
          setUser({
            id: authUser.id,
            email: authUser.email!,
            role: newProfile?.role || 'user',
            profile: newProfile,
          });
        }
      } else if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: profile.role,
          profile,
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: 'user',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser({
        id: authUser.id,
        email: authUser.email!,
        role: 'user',
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, organization?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            organization,
          },
        },
      });

      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      const { data: updatedProfile, error } = await profileQueries.updateProfile(user.id, updates);
      
      if (error) {
        return { error };
      }

      if (updatedProfile) {
        setUser(prev => prev ? {
          ...prev,
          profile: updatedProfile,
          role: updatedProfile.role,
        } : null);
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}