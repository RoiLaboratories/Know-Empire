'use client';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';
import { createPublicClient, http } from 'viem';

// Configure the Base chain with an RPC URL
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
const configuredBase = {
  ...base,
  rpcUrls: {
    ...base.rpcUrls,
    default: {
      http: [rpcUrl],
    },
    public: {
      http: [rpcUrl],
    },
  },
};

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={configuredBase}
    >
      {children}
    </MiniKitProvider>
  );
}
