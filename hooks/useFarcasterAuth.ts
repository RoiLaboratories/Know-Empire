import { useCallback, useEffect, useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

interface SuiteContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
}

export function useFarcasterAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { context } = useMiniKit() as { context: SuiteContext };
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // Check if user is authenticated in MiniKit context
    if (context?.user?.fid) {
      setIsAuthenticated(true);
    } else {
      // Check local storage as fallback
      const storedUser = localStorage.getItem('farcaster_user');
      setIsAuthenticated(!!storedUser);
    }
  }, [context]);

  const connectWallet = useCallback(() => {
    try {
      if (connectors[0]) {
        connect({ connector: connectors[0] });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    address,
    isConnected,
    isAuthenticated,
    connectWallet,
    disconnectWallet
  };
}
