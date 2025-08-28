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
        const accounts = await baseConnector.getAccounts?.() ?? [];
        if (!accounts[0]) throw new Error('No accounts found');
        
        return {
          accounts,
          chainId: base.id,
        };
      },

      async disconnect() {
        await baseConnector.disconnect?.();
      },

      async getAccounts() {
        return baseConnector.getAccounts?.() ?? [];
      },

      async getChainId() {
        return base.id;
      },

      async getProvider({ chainId }: { chainId?: number } = {}) {
        return baseConnector.getProvider?.() ?? null;
      },

      async isAuthorized() {
        const accounts = await this.getAccounts();
        return !!accounts[0];
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
