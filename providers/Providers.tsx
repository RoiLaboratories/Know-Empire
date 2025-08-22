'use client';

import { PrivyAuthProvider } from './PrivyAuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyAuthProvider>
      {children}
    </PrivyAuthProvider>
  );
}
