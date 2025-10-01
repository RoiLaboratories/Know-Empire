"use client";

import CartProvider from "@/providers/cart";
import OrdersProvider from "@/providers/orders";
import { Toaster } from 'react-hot-toast';
import { FarcasterAuthProvider } from "@/context/FarcasterAuthContext";
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';
import { WagmiProviderWrapper } from "@/providers/wagmi";
import Modal from "@/context/ModalContext";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <WagmiProviderWrapper>
        <MiniKitProvider chain={base}>
          <FarcasterAuthProvider>
            <CartProvider>
              <OrdersProvider>
                <Modal>
                  {children}
                </Modal>
              </OrdersProvider>
            </CartProvider>
          </FarcasterAuthProvider>
        </MiniKitProvider>
      </WagmiProviderWrapper>
      <Toaster 
        toastOptions={{
          style: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
        gutter={8}
        containerStyle={{
          top: 20
        }}
      />
    </>
  );
};

export default ClientProviders;
