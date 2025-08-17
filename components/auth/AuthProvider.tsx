'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';

const config = {
  relay: 'https://relay.farcaster.xyz',
  domain: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  siweUri: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  version: '1',
  timeout: 30000,
  chain: optimism,
  frameConfig: {
    version: 'vNext',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID
  }
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
