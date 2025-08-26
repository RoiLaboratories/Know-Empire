import { useCallback } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';

export function useFarcasterAuth() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
    connectWallet,
    disconnectWallet
  };
}
