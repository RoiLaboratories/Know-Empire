import { createConnector } from 'wagmi';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { base } from 'wagmi/chains';

export function customFarcasterConnector() {
  return createConnector((config) => {
    const connector = farcasterMiniApp()(config);
    return {
      ...connector,
      id: 'farcaster',
      name: 'Farcaster',
      type: 'farcaster',
      async connect(args) {
        const result = await connector.connect(args);
        return {
          ...result,
          chainId: base.id
        };
      },
      async getChainId() {
        return base.id;
      },
      async isAuthorized() {
        return connector.isAuthorized?.() ?? false;
      }
    };
  });
}
