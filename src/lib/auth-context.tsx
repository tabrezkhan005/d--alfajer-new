"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { createCustomer } from "@/src/app/actions";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string, country: string) => Promise<{ error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Transform Supabase user to our User type
  const transformUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email || "",
      phone: supabaseUser.user_metadata?.phone || undefined,
      address: supabaseUser.user_metadata?.address || undefined,
      country: supabaseUser.user_metadata?.country || undefined,
    };
  };

  // Check session on mount and listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setUser(transformUser(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      setUser(transformUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      // Create customer record if doesn't exist
      if (data.user) {
        // Use server action to bypass RLS
        await createCustomer(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
          data.user.user_metadata?.country || "AE" // Default or existing
        );
      }

      setIsLoading(false);
      return {};
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return { error: "An unexpected error occurred" };
    }
  };

  const signup = async (name: string, email: string, password: string, country: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            country,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      // Create customer record
      if (data.user) {
        // Use server action to bypass RLS
        await createCustomer(data.user.id, email, name, country);
      }

      setIsLoading(false);
      return {};
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      return { error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoggedIn: !!user,
        login,
        logout,
        signup,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
