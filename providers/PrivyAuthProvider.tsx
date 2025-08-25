import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

// Configure Privy with Base network settings
import type { PrivyClientConfig } from '@privy-io/react-auth';

const baseMainnet = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.base.org'] },
    default: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://basescan.org' },
  },
};

const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://sepolia.base.org'] },
    default: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
};

const config: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#676FFF' as `#${string}`,
    logo: '/group.svg',
  },
  supportedChains: [baseMainnet, baseSepolia],
  defaultChain: process.env.NODE_ENV === 'production' ? baseMainnet : baseSepolia,
};

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={config}
    >
      {children}
    </PrivyProvider>
  );
}
