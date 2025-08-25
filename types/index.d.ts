declare module '@know-empire/types' {
    export interface WalletConnection {
        address: string;
        chainId: number;
        connector: 'privy' | 'metamask' | 'walletconnect';
    }

    export interface WalletInfo {
        address: string;
        network: string;
        isConnected: boolean;
    }
}
