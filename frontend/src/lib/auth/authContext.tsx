'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user type
export interface User {
  id: number | string;
  name?: string;
  email: string;
  role?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // authFetch will attach Authorization header when a token is present, or use credentials for cookie flows
  authFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  // current raw token (if using token flow)
  token: string | null;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Base API URL (set NEXT_PUBLIC_API_BASE in frontend env if backend is on different origin)
  const BASE = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_BASE ?? '') : '';

  // Check for existing session on mount by calling /api/user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prefer token stored in localStorage
        const storedToken = localStorage.getItem('finwave_token');
        if (storedToken) {
          setToken(storedToken);
          const resp = await fetch(`${BASE}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (resp.ok) {
            const json = await resp.json();
            setUser(json);
            localStorage.setItem('finwave_user', JSON.stringify(json));
            setIsLoading(false);
            return;
          } else {
            // invalid token -> clear
            setToken(null);
            localStorage.removeItem('finwave_token');
          }
        }

        // Fallback to session cookie-based check
        const resp = await fetch(`${BASE}/api/user`, { credentials: 'include' });
        if (resp.ok) {
          const json = await resp.json();
          setUser(json);
          localStorage.setItem('finwave_user', JSON.stringify(json));
        } else {
          const storedUser = localStorage.getItem('finwave_user');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        const storedUser = localStorage.getItem('finwave_user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [BASE]);

  // Mock login function - will be replaced with real API call later
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Try token-based login first (API token)
      const tokenResp = await fetch(`${BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (tokenResp.ok) {
        const json = await tokenResp.json();
        const receivedToken = json.token as string | undefined;
        if (receivedToken) {
          // store token locally (app chooses storage; localStorage used here for simplicity)
          setToken(receivedToken);
          localStorage.setItem('finwave_token', receivedToken);
          const userData = json.user ?? (await (await fetch(`${BASE}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${receivedToken}` } })).json());
          setUser(userData);
          localStorage.setItem('finwave_user', JSON.stringify(userData));
          return true;
        }
      }

      // Fallback to cookie-based (Sanctum SPA) login
      await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: 'include' });

      const resp = await fetch(`${BASE}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        return false;
      }

      // fetch authenticated user
      const userResp = await fetch(`${BASE}/api/user`, { credentials: 'include' });
      if (!userResp.ok) return false;
      const data = await userResp.json();
      setUser(data);
      localStorage.setItem('finwave_user', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        // token-based logout (revoke current token)
        await fetch(`${BASE}/api/v1/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        setToken(null);
        localStorage.removeItem('finwave_token');
      }

      // Also attempt session logout for cookie-based flows
      try {
        await fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        // ignore
      }
    } catch (error) {
      console.warn('Logout request failed', error);
    }

    setUser(null);
    localStorage.removeItem('finwave_user');
  };

  // authFetch helper that attaches Authorization header when token exists, or falls back to credentials include
  const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers ?? {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const opts: RequestInit = {
      ...init,
      headers,
      // If no token, include credentials for cookie-based auth
      credentials: token ? (init.credentials ?? 'omit') : 'include',
    };

    return fetch(input, opts);
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    authFetch,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};