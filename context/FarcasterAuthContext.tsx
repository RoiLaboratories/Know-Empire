'use client';

import React, { createContext, useContext } from 'react';
import { useFarcasterAuth } from '../hooks/useFarcasterAuth';

interface FarcasterAuthContextType {
  isAuthenticated: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => void;
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined);

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, signIn, signOut } = useFarcasterAuth();

  return (
    <FarcasterAuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </FarcasterAuthContext.Provider>
  );
}

export function useFarcasterContext() {
  const context = useContext(FarcasterAuthContext);
  if (context === undefined) {
    throw new Error('useFarcasterContext must be used within a FarcasterAuthProvider');
  }
  return context;
}
