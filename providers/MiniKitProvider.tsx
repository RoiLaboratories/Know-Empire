'use client';

import { ReactNode } from 'react';

// Simple pass-through provider since we're using Farcaster SDK directly
export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
