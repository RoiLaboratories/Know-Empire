'use client';

import { AuthKitProvider } from '@farcaster/auth-kit';
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';

// Configure the chain with Alchemy RPC URL
const rpcUrl = `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

// Create a Viem public client with the Alchemy RPC URL
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
  chain: optimism,
  transport: http(rpcUrl),
  publicClient
};

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  );
}
