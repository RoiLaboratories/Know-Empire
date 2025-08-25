declare module '@know-empire/types' {
    export interface WalletConnection {
        address: string;
        chainId: number;
        connector: string;
    }
}