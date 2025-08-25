"use client";

import CartProvider from "@/providers/cart";
import OrdersProvider from "@/providers/orders";
import { Toaster } from 'react-hot-toast';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <CartProvider>
        <OrdersProvider>
          {children}
        </OrdersProvider>
      </CartProvider>
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
