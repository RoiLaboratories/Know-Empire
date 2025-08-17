'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';

const config = {
  relay: 'https://relay.farcaster.xyz',
  domain: process.env.NEXT_PUBLIC_URL as string,
  siweUri: process.env.NEXT_PUBLIC_URL as string,
  version: '1',
  timeout: 30000,
  chain: optimism,
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
