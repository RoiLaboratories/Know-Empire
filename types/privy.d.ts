import { PrivyClient } from '@privy-io/react-auth';

declare module '@privy-io/react-auth' {
  interface Wallet {
    chainId: string | number;
    address: string;
    disconnect(): Promise<void>;
    switchChain(chainId: number): Promise<void>;
  }

  interface User extends PrivyClient {
    wallet: Wallet | null;
  }
}
