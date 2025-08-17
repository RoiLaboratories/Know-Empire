'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider>
      {children}
    </AuthKitProvider>
  );
}
