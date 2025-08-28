import { createConnector } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { base } from 'wagmi/chains';

export function customFarcasterConnector() {
  return createConnector((config) => ({
    ...farcasterMiniApp()(config),
    id: 'farcaster',
    name: 'Farcaster',
    type: 'farcaster',
    getChainId: () => Promise.resolve(base.id),
    async connect({ chainId }: { chainId?: number } = {}) {
      const connector = farcasterMiniApp()(config);
      const account = await connector.connect?.({ chainId: chainId ?? base.id });
      return {
        ...account,
        chainId: base.id
      };
    },
    async disconnect() {
      const connector = farcasterMiniApp()(config);
      await connector.disconnect?.();
    },
    async getAccounts() {
      const connector = farcasterMiniApp()(config);
      return connector.getAccounts?.() ?? [];
    },
    async getProvider({ chainId }: { chainId?: number } = {}) {
      const connector = farcasterMiniApp()(config);
      return connector.getProvider?.({ chainId: chainId ?? base.id });
    },
    async isAuthorized() {
      const connector = farcasterMiniApp()(config);
      return connector.isAuthorized?.() ?? false;
    },
    async switchChain(args: { chainId: number }) {
      const connector = farcasterMiniApp()(config);
      if (args.chainId !== base.id) {
        throw new Error('Chain switching not supported');
      }
      return base;
    }
  }));
}
