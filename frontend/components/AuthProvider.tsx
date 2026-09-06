'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  api,
} from '@/lib/api';

import type {
  User,
} from '@/lib/types';


type AuthContextValue = {
  user:
    User | null;

  loading:
    boolean;

  refresh:
    () => Promise<void>;

  logout:
    () => Promise<void>;
};


const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);


export function AuthProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const refresh =
    useCallback(
      async () => {
        try {
          const response =
            await api.get<
              User | null
            >(
              '/auth/me',
            );

          setUser(
            response.data,
          );
        } catch {
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      [],
    );


  useEffect(() => {
    refresh();
  }, [refresh]);


  async function logout() {
    try {
      await api.post(
        '/auth/logout',
      );
    } finally {
      setUser(null);

      window.location.href =
        '/';
    }
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}
