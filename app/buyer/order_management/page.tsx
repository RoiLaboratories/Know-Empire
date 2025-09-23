"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../../../ui/BackButton";
import Search from "../../../components/Search";
import Tab from "../../../components/layout/Tab";
import OrdersCard from "../../../components/cards/OrdersCard";
import LoadingCard from "../../../components/popups/loading-card";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { useAccount } from 'wagmi';
import { toast } from "react-hot-toast";
import { confirmDelivery } from "@/utils/contractHelpers";

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  created_at: string;
  tracking_number: string;
  shipped_at: string | null;
  delivered_at: string | null;
  total_amount: number;
  escrow_id: string;
  product: {
    id: string;
    title: string;
    description: string;
    photos: string[];
    price: number;
    user: {
      farcaster_username: string;
    };
  };
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { context } = useMiniKit();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);

  const fetchBuyerOrders = useCallback(async () => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      setLoading(true);
      console.log('Fetching orders for buyer FID:', context.user.fid);

      const response = await fetch(`/api/buyer/orders?fid=${context.user.fid}`);
      if (!response.ok) {
        console.error('Server responded with status:', response.status);
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Received orders:', data);

      // Sort orders by creation date, most recent first
      const sortedOrders = data.sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(sortedOrders || []);
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [context?.user?.fid]);

  useEffect(() => {
    fetchBuyerOrders();
  }, [fetchBuyerOrders]);

  const handleConfirmDelivery = async (orderId: string, escrowId: string) => {
    try {
      if (!context?.user?.fid) {
        toast.error("Please connect your Farcaster account");
        return;
      }
      if (!isConnected) {
        toast.error("Please connect your wallet");
        return;
      }

      setConfirmingDelivery(true);
      console.log("[Confirm Delivery] Starting confirmation:", { 
        orderId, 
        escrowId,
        fid: context.user.fid,
        isConnected,
        walletStatus: isConnected ? "connected" : "disconnected"
      });

      // First confirm on smart contract
      const txHash = await confirmDelivery(escrowId);
      console.log("[Confirm Delivery] Smart contract success:", {
        orderId,
        escrowId,
        txHash
      });

      // After successful contract confirmation, update database status to completed
      const response = await fetch(`/api/buyer/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "completed",
          fid: context.user.fid 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Confirm Delivery] API error:", {
          status: response.status,
          error: errorText,
          orderId,
          escrowId
        });
        throw new Error("Failed to update order status: " + errorText);
      }

      const apiResult = await response.json();
      console.log("[Confirm Delivery] API success:", {
        orderId,
        escrowId,
        result: apiResult
      });
      
      toast.success("Delivery confirmed successfully!");
      await fetchBuyerOrders();
    } catch (error) {
      console.error("[Confirm Delivery] Error:", {
        orderId,
        escrowId,
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error(error instanceof Error ? error.message : "Failed to confirm delivery");
    } finally {
      setConfirmingDelivery(false);
    }
  };

  // Redirect to empty orders page if no orders are found
  useEffect(() => {
    if (!loading && orders.length === 0) {
      router.push('/buyer/empty-order');
    }
  }, [loading, orders.length, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <LoadingCard message="Loading orders..." />
      </div>
    );
  }

  // If no orders, return null as we're redirecting
  if (orders.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col items-center min-h-screen pb-3 bg-white">
      {confirmingDelivery && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <LoadingCard message="Confirming delivery..." />
        </div>
      )}
      <div className="w-9/10 max-w-lg flex flex-col flex-1 gap-y-1">
        <div className="sticky top-0 space-y-3 py-3 bg-white">
          <div className="px-4 mt-4">
            <BackButton onClick={() => router.back()} />
          </div>
          <Tab
            name="My Orders"
            description="Track your purchases and leave reviews"
          />
          <div className="mt-6">
            <Search placeholder="Search orders..." />
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-5 mt-2.5">
          {orders.map((order) => {
            console.log("[BuyerOrderManagement] Order Debug:", {
              orderId: order.id,
              status: order.status,
              tracking: order.tracking_number,
              escrowId: order.escrow_id,
              shouldShowConfirmDelivery: order.status.toLowerCase() === 'shipped'
            });
            return (
              <OrdersCard
                key={order.id}
                status={order.status.toLowerCase()}
                name={order.product.title}
                img={order.product.photos[0] || '/placeholder.png'}
                seller={order.product.user.farcaster_username}
                price={order.total_amount.toFixed(2)}
                id={order.id}
                escrowId={order.escrow_id}
                trackingNumber={order.status.toLowerCase() !== 'pending' ? order.tracking_number : undefined}
                onConfirmDelivery={
                order.status.toLowerCase() === 'shipped' 
                  ? () => handleConfirmDelivery(order.id, order.escrow_id)
                  : undefined
              }
              disableConfirm={order.status.toLowerCase() !== 'shipped'}
            />
            );
          })}
        </ul>
      </div>
    </section>
  );
}
