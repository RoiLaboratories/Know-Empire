'use client';

import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { optimism } from 'viem/chains';

const MiniKitContextProvider = ({ children }: { children: ReactNode }) => {
  return (
    <MiniKitProvider
      chain={optimism}
      rpcUrl={`https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`}
    >
      {children}
    </MiniKitProvider>
  );
};

export default MiniKitContextProvider;
