import { base } from 'wagmi/chains';
import { createConnector } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

export function customFarcasterConnector() {
  const connector = createConnector(config => {
    const baseConnector = farcasterMiniApp()(config);

    return {
      chains: [base],
      id: 'farcaster',
      name: 'Farcaster',
      type: 'farcaster' as const,
      
      async connect() {
        try {
          // Try to get accounts from the base connector first
          const accounts = await baseConnector.getAccounts?.() ?? [];
          
          // If no accounts from base connector, try to get from miniapp context
          if (!accounts[0]) {
            const minikit = (window as any).MiniApp;
            if (minikit?.context?.user?.verified_accounts?.[0]?.wallet_address) {
              return {
                accounts: [minikit.context.user.verified_accounts[0].wallet_address],
                chainId: base.id,
              };
            }
            throw new Error('Farcaster wallet did not connect. Please make sure you are in Warpcast and have a verified wallet.');
          }
          
          return {
            accounts,
            chainId: base.id,
          };
        } catch (error) {
          console.error('Farcaster connection error:', error);
          throw error;
        }
      },

      async disconnect() {
        await baseConnector.disconnect?.();
      },

      async getAccounts() {
        try {
          // Try base connector first
          const accounts = await baseConnector.getAccounts?.() ?? [];
          if (accounts[0]) return accounts;
          
          // Fall back to miniapp context
          const minikit = (window as any).MiniApp;
          const verifiedWallet = minikit?.context?.user?.verified_accounts?.[0]?.wallet_address;
          return verifiedWallet ? [verifiedWallet] : [];
        } catch (error) {
          console.error('Error getting accounts:', error);
          return [];
        }
      },

      async getChainId() {
        return base.id;
      },

      async getProvider({ chainId }: { chainId?: number } = {}) {
        return baseConnector.getProvider?.() ?? null;
      },

      async isAuthorized() {
        try {
          // Check base connector accounts
          const accounts = await this.getAccounts();
          if (accounts[0]) return true;
          
          // Check miniapp context
          const minikit = (window as any).MiniApp;
          return !!minikit?.context?.user?.verified_accounts?.[0]?.wallet_address;
        } catch (error) {
          console.error('Error checking authorization:', error);
          return false;
        }
      },

      async switchChain({ chainId }) {
        if (chainId !== base.id) {
          throw new Error('Chain switching not supported. Only Base chain is available.');
        }
        return base;
      },

      onAccountsChanged(accounts) {
        baseConnector.onAccountsChanged?.(accounts);
      },

      onChainChanged(chainId) {
        // Chain changes are not supported, always on Base
        baseConnector.onChainChanged?.(chainId);
      },

      onDisconnect(error) {
        baseConnector.onDisconnect?.(error);
      },
    };
  });
  
  return connector;
}
