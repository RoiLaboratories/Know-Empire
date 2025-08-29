'use client';

import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/helpers";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { confirmDeliveryBySeller } from '@/utils/contractHelpers';
import { useAccount } from 'wagmi';
import { generateTrackingId } from '@/utils/tracking';
import Button from '@/ui/Button';
import BackButton from "@/ui/BackButton";
import CopyIcon from '@/assets/images/copy.png';

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  total_amount: number;
  escrow_id: string;
  isPaid: boolean;
  product: {
    id: string;
    title: string;
    photos: string[];
    seller: {
      username: string;
      wallet_address: string;
    };
  };
}

const SellerOrderManagement: NextPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/seller/orders?fid=${context.user.fid}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      
      // If there are no orders, redirect to empty state page
      if (!data || data.length === 0) {
        router.push('/seller/empty-orders');
        return;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [context?.user?.fid, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let pullStartY = 0;
    let pullMoveY = 0;
    const pullThreshold = 60; // pixels to pull before refresh

    const touchStart = (e: TouchEvent) => {
      const { scrollTop } = document.documentElement;
      if (scrollTop <= 0) {
        pullStartY = e.touches[0].screenY;
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (pullStartY === 0 || refreshing) return;
      
      pullMoveY = e.touches[0].screenY - pullStartY;
      if (pullMoveY > 0 && pullMoveY < pullThreshold) {
        e.preventDefault();
      }
    };

    const touchEnd = async () => {
      if (pullMoveY >= pullThreshold && !refreshing) {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
      }
      pullStartY = 0;
      pullMoveY = 0;
    };

    document.addEventListener('touchstart', touchStart);
    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', touchEnd);

    return () => {
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd);
    };
  }, [refreshing, fetchOrders]);

  // The rest of your component remains the same...
  // Update tracking number
  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      const response = await fetch(`/api/seller/orders/${orderId}/tracking?select=*,product(*)`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tracking_number: trackingNumber,
          fid: context.user.fid 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update tracking number');
      }
      
      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setOrders(orders.map(order => 
        order.id === orderId 
          ? updatedOrder
          : order
      ));

      toast.success('Tracking number updated');
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking number');
    }
  };

  // Mark as shipped (first stage - no contract interaction)
  const markAsShipped = async (orderId: string) => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      setLoading(true);

      // Generate a unique tracking ID
      const trackingId = generateTrackingId();

      // Update status in the database and fetch updated order with product data
      const response = await fetch(`/api/seller/orders/${orderId}/status?select=*,product(*)`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'shipped',
          tracking_number: trackingId,
          fid: context.user.fid 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setOrders(orders.map(order => 
        order.id === orderId 
          ? updatedOrder
          : order
      ));

      toast.success('Order marked as shipped');
    } catch (error) {
      console.error('Error marking as shipped:', error);
      toast.error('Failed to mark order as shipped');
    } finally {
      setLoading(false);
    }
  };

  // Mark as delivered (second stage - includes contract interaction)
  const markAsDelivered = async (orderId: string, escrowId: string) => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      if (!isConnected || !address) {
        toast.error('Please connect your wallet first');
        return;
      }

      setLoading(true);

      // Confirm delivery in the smart contract
      try {
        await confirmDeliveryBySeller(escrowId);
      } catch (error: any) {
        console.error('Contract error:', error);
        toast.error(error.message || 'Failed to update escrow state');
        return;
      }

      // Update status in the database and fetch updated order with product data
      const response = await fetch(`/api/seller/orders/${orderId}/status?select=*,product(*)`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'delivered',
          fid: context.user.fid 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setOrders(orders.map(order => 
        order.id === orderId 
          ? updatedOrder
          : order
      ));

      toast.success('Order marked as delivered');
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to mark order as delivered');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Tracking ID copied to clipboard'))
      .catch(() => toast.error('Failed to copy tracking ID'));
  };

  const filteredOrders = orders.filter(order => 
    order.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 pt-8">
        {refreshing && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
            <div className="bg-primary text-white text-sm py-1 px-4 rounded-b-lg">
              Refreshing...
            </div>
          </div>
        )}
        
        <div className="flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white space-y-3 pb-3">
            <div className="space-y-4">
              <div>
                <BackButton />
              </div>
              <div className="flex justify-center">
                <h1 className="text-xl font-bold">Order Management</h1>
              </div>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Search orders by title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#989898] text-sm outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">No orders found</div>
          ) : (
            <div className="w-full space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="w-full rounded-lg bg-white border border-[#989898] p-4 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-11 relative">
                        <Image
                          className="w-full h-full object-cover rounded"
                          width={40}
                          height={44}
                          alt={order.product.title}
                          src={order.product.photos[0]}
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="font-semibold text-sm text-[#414141]">
                          {order.product.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {order.id.slice(0, 8)}...
                        </div>
                        <div className="text-sm font-medium text-[#16a34a]">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium capitalize flex items-center gap-1.5 ${
                      order.status === 'pending' ? 'bg-[#fef9c3] text-[#925f21]' :
                      order.status === 'shipped' ? 'bg-[#dbeafe] text-[#1e43be]' :
                      order.status === 'delivered' ? 'bg-[#dcfce7] text-[#166534]' :
                      'bg-[#fef9c3] text-[#925f21]'
                    }`}>
                      <Image
                        width={14}
                        height={15}
                        alt=""
                        src={
                          order.status === 'pending' ? '/Vector.svg' :
                          order.status === 'shipped' ? '/Vector-2.svg' :
                          order.status === 'delivered' ? '/check.svg' :
                          '/Vector.svg'
                        }
                        className="w-3.5 h-[15px]"
                      />
                      <span>{order.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full text-[#6b88b5]">
                    <div className="text-sm">Tracking ID:</div>
                    <div className="w-full rounded-lg bg-[#f1f1f1] border border-[#989898] flex items-center p-2.5">
                      <input
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[#989898]"
                        // placeholder="Enter tracking number"
                        type="text"
                        value={order.tracking_number || ''}
                        onChange={(e) => updateTrackingNumber(order.id, e.target.value)}
                        readOnly={order.status !== 'pending'}
                      />
                      {order.tracking_number && order.status !== 'pending' && (
                        <button
                          onClick={() => copyToClipboard(order.tracking_number!)}
                          className="ml-2 p-1 hover:opacity-80 transition-opacity"
                        >
                          <Image
                            src={CopyIcon}
                            alt="Copy"
                            width={16}
                            height={16}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                  {(order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered') && (
                    <>
                      <div className="w-full h-px bg-[#989898] my-2" />
                      {order.status === 'pending' && (
                        <button 
                          className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => markAsShipped(order.id)}
                          disabled={loading || !context?.user?.fid}
                        >
                          <Image
                            className="w-[22px] h-[18px]"
                            width={22}
                            height={18}
                            alt=""
                            src="/Vector-11.svg"
                          />
                          <span className="text-sm font-semibold">
                            Mark as shipped
                          </span>
                        </button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <button 
                          className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => markAsDelivered(order.id, order.escrow_id)}
                          disabled={loading || !isConnected || !context?.user?.fid}
                        >
                          <Image
                            className="w-[22px] h-[18px]"
                            width={22}
                            height={18}
                            alt=""
                            src="/Vector-11.svg"
                          />
                          <span className="text-sm font-semibold">
                            Mark as delivered
                          </span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <>
                          <button 
                            className="w-full flex items-center justify-center gap-2.5 bg-[#ef4444] text-white rounded-lg py-2.5 px-5 mb-2"
                            onClick={() => router.push(`/raise-dispute?orderId=${order.id}`)}
                          >
                            <span className="text-sm font-semibold">
                              Raise a dispute
                            </span>
                          </button>
                          {!order.isPaid && (
                            <button 
                              className="w-full flex items-center justify-center gap-2.5 bg-[#22c55e] text-white rounded-lg py-2.5 px-5"
                            >
                              <span className="text-sm font-semibold">
                                Mark as paid
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SellerOrderManagement;
