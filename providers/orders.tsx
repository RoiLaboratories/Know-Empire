"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { OrdersCardProps } from "../components/cards/OrdersCard";

export interface Order extends OrdersCardProps {
  created_at?: string;
  updated_at?: string;
  tracking_number?: string | null;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
}

interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  hasOrders: boolean;
  isLoading: boolean;
  error: string | null;
  refetchOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get user from localStorage if context is not available
      const storedUser = localStorage.getItem('farcaster_user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.fid) {
        console.error('No user FID found');
        return;
      }

      const response = await fetch(`/api/orders?fid=${user.fid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const value = {
    orders,
    setOrders,
    hasOrders: orders.length > 0,
    isLoading,
    error,
    refetchOrders: fetchOrders
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export default OrdersProvider;

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
