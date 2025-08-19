'use client';

import { ReactNode } from 'react';

// This provider is no longer needed as we're using @farcaster/miniapp-sdk directly
export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
