'use client';

import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

// Create wagmi config for Farcaster wallet interaction
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  connectors: [farcasterMiniApp()]
});

// Create a client for managing cache
const queryClient = new QueryClient();

// Wrap your app with providers
export function WagmiProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
