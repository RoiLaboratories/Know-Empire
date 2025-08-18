'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { optimism } from 'viem/chains';

// Configure the chain with an RPC URL
const rpcUrl = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io'; // Fallback to public RPC
const configuredOptimism = {
  ...optimism,
  rpcUrls: {
    ...optimism.rpcUrls,
    default: {
      http: [rpcUrl],
    },
    public: {
      http: [rpcUrl],
    },
  },
};

const config = {
  relay: 'https://relay.farcaster.xyz',
  domain: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  siweUri: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  version: '1',
  timeout: 30000,
  chain: configuredOptimism,
  frameConfig: {
    version: 'vNext',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID
  },
  disableAnalytics: true // Disable Farcaster analytics
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
