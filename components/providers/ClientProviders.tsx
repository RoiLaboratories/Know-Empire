"use client";

import CartProvider from "../../providers/cart";
import MiniKitContextProvider from "../../providers/MiniKitProvider";
import AuthProvider from "../auth/AuthProvider";
import { FarcasterAuthProvider } from "../../context/FarcasterAuthContext";
import OrdersProvider from "../../providers/orders";
import { Toaster } from 'react-hot-toast';

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <CartProvider>
        <MiniKitContextProvider>
          <AuthProvider>
            <FarcasterAuthProvider>
              <OrdersProvider>
                {children}
              </OrdersProvider>
            </FarcasterAuthProvider>
          </AuthProvider>
        </MiniKitContextProvider>
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
