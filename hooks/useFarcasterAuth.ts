import { useCallback } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface SuiteContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    verified_accounts?: Array<{ wallet_address: string }>;
  };
  getSigner?: () => Promise<any>;
  isTestnet?: boolean;
}

export function useFarcasterAuth() {
  const { context } = useMiniKit() as { context: SuiteContext };
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const connectWallet = useCallback(async () => {
    try {
      const connector = connectors[0]; // Using the first available connector
      if (connector) {
        await connect({ connector });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Wallet connection error:', error);
      return false;
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    isAuthenticated: !!context?.user,
    signIn: connectWallet,
    signOut: disconnectWallet,
    address,
    isConnected,
  };
}
