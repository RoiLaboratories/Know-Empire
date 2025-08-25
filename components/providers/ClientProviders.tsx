"use client";

import CartProvider from "@/providers/cart";
import OrdersProvider from "@/providers/orders";
import { Toaster } from 'react-hot-toast';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from 'wagmi/chains';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <MiniKitProvider chain={base}>
        <CartProvider>
          <OrdersProvider>
            {children}
          </OrdersProvider>
        </CartProvider>
      </MiniKitProvider>
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
