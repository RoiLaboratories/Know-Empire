'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';

// Configure the chain with an RPC URL
const rpcUrl = process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io';

// Create a Viem public client with the RPC URL
const publicClient = createPublicClient({
  chain: optimism,
  transport: http(rpcUrl)
});

const config = {
  relay: 'https://relay.farcaster.xyz',
  domain: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  siweUri: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  version: '1',
  timeout: 30000,
  viemTransport: http(rpcUrl),
  options: {
    analytics: {
      enabled: false
    }
  }
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
