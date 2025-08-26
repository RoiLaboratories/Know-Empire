"use client";

import CartProvider from "@/providers/cart";
import OrdersProvider from "@/providers/orders";
import { Toaster } from 'react-hot-toast';
import { WagmiProviderWrapper } from "@/providers/wagmi";
import { FarcasterAuthProvider } from "@/context/FarcasterAuthContext";

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <WagmiProviderWrapper>
        <FarcasterAuthProvider>
          <CartProvider>
            <OrdersProvider>
              {children}
            </OrdersProvider>
          </CartProvider>
        </FarcasterAuthProvider>
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
