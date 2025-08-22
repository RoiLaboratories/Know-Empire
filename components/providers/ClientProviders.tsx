"use client";

import { CartProvider } from "../../providers/cart";
import { MiniKitContextProvider } from "../../providers/MiniKitProvider";
import AuthProvider from "../auth/AuthProvider";
import { FarcasterAuthProvider } from "../../context/FarcasterAuthContext";
import OrdersProvider from "../../providers/orders";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
