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
import { Icon } from "@iconify/react";
import { ICON } from "@/utils/icon-export";


interface SellerOrder {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  tracking_number: string | null;
  total_amount: number;
  escrow_id: string;
  is_paid: boolean;
  product: {
    id: string;
    title: string;
    photos: string[];
  };
  buyer: {
    farcaster_username: string;
    phone_number: string;
    shipping_address: string;
  };
}

interface BuyerOrder {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  tracking_number: string | null;
  total_amount: number;
  escrow_id: string;
  product: {
    id: string;
    title: string;
    photos: string[];
    user: {
      farcaster_username: string;
    };
  };
}

const SellerOrderManagement: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'seller' | 'buyer'>('seller');
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState<{ [orderId: string]: string }>({});
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
      
      // Fetch both seller and buyer orders in parallel
      const [sellerResponse, buyerResponse] = await Promise.all([
        fetch(`/api/seller/orders?fid=${context.user.fid}&select=id,status,tracking_number,total_amount,escrow_id,product:products(*)`),
        fetch(`/api/buyer/orders?fid=${context.user.fid}`)
      ]);

      if (!sellerResponse.ok) throw new Error('Failed to fetch seller orders');
      if (!buyerResponse.ok) throw new Error('Failed to fetch buyer orders');

      const sellerData = await sellerResponse.json();
      const buyerData = await buyerResponse.json();
      
      // If both arrays are empty, redirect to empty state page
      if ((!sellerData || sellerData.length === 0) && (!buyerData || buyerData.length === 0)) {
        router.push('/seller/empty-orders');
        return;
      }
      
      setSellerOrders(sellerData || []);
      setBuyerOrders(buyerData || []);
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

      const response = await fetch(`/api/seller/orders/${orderId}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tracking_number: trackingNumber,
          fid: context.user.fid,
          select: 'id,status,tracking_number,total_amount,escrow_id,isPaid,product:products(*)'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update tracking number');
      }
      
      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setSellerOrders(sellerOrders.map(order => 
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

      const trackingNumber = trackingNumbers[orderId];
      if (!trackingNumber) {
        toast.error('Please enter a tracking ID first');
        return;
      }

      setLoading(true);

      // Update status in the database and fetch updated order with product data
      const response = await fetch(`/api/seller/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'shipped',
          tracking_number: trackingNumber,
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
      setSellerOrders(sellerOrders.map(order => 
        order.id === orderId 
          ? updatedOrder
          : order
      ));

      // Clear the tracking number from state
      setTrackingNumbers(prev => {
        const { [orderId]: _, ...rest } = prev;
        return rest;
      });

      toast.success('Order marked as shipped');
    } catch (error) {
      console.error('Error marking as shipped:', error);
      toast.error('Failed to mark order as shipped');
    } finally {
      setLoading(false);
    }
  };

  // Mark as completed (final stage - after delivery)
  const markAsCompleted = async (orderId: string) => {
    try {
      if (!context?.user?.fid) {
        toast.error('Please connect with Farcaster first');
        return;
      }

      setLoading(true);

      // Update status in the database
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'completed',
          fid: context.user.fid
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark order as completed');
      }

      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setSellerOrders(sellerOrders.map(order => 
        order.id === orderId 
          ? updatedOrder
          : order
      ));

      toast.success('Order marked as completed');
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast.error('Failed to mark order as completed');
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
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'delivered',
          fid: context.user.fid,
          select: 'id,status,tracking_number,total_amount,escrow_id,isPaid,product:products(*)'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update order status');
      }

      // Get the updated order data from response
      const updatedOrder = await response.json();
      
      // Update local state with the full returned order data
      setSellerOrders(sellerOrders.map(order => 
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
  const copyToClipboard = async (text: string) => {
    try {
      // Try using Clipboard API first
      try {
        await navigator.clipboard.writeText(text);
      } catch (clipboardErr) {
        // Fallback to execCommand
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      toast.success('Tracking ID copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy tracking ID');
    }
  };

  const filteredOrders = activeTab === 'seller'
    ? sellerOrders.filter(order => 
        order.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : buyerOrders.filter(order => 
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
                <BackButton onClick={() => router.push('/marketplace')} />
              </div>
              <div className="flex justify-center">
                <h1 className="text-xl font-bold">Order Management</h1>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('seller')}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'seller'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Sales
              </button>
              <button
                onClick={async () => {
                  if (!context?.user?.fid) {
                    toast.error('Please connect with Farcaster first');
                    return;
                  }

                  try {
                    // Check if the seller has any purchases
                    const response = await fetch(`/api/buyer/orders?fid=${context.user.fid}`);
                    const orders = await response.json();

                    // Redirect based on whether they have purchases or not
                    if (Array.isArray(orders) && orders.length > 0) {
                      router.push('/buyer/order_management');
                    } else {
                      router.push('/buyer/empty-order');
                    }
                  } catch (error) {
                    console.error('Error checking buyer orders:', error);
                    router.push('/buyer/empty-order');
                  }
                }}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'buyer'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Purchases
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder={`Search ${activeTab === 'seller' ? 'orders to fulfill' : 'your purchases'} by title or ID...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#989898] text-sm outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading orders...</div>
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
                        {activeTab === 'buyer' && (
                          <div className="text-xs text-gray-500">
                            Seller: @{(order as BuyerOrder).product.user.farcaster_username}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium capitalize flex items-center gap-1.5 ${
                      order.status === 'pending' ? 'bg-[#fef9c3] text-[#925f21]' :
                      order.status === 'shipped' ? 'bg-[#dbeafe] text-[#1e43be]' :
                      order.status === 'delivered' ? 'bg-[#dcfce7] text-[#166534]' :
                      order.status === 'completed' ? 'bg-[#dcfce7] text-[#15803d]' :
                      order.status === 'cancelled' ? 'bg-[#fee2e2] text-[#991b1b]' :
                      'bg-[#fef9c3] text-[#925f21]'
                    }`}>
                      <Image
                        width={14}
                        height={15}
                        alt=""
                        src={
                          order.status === 'pending'
                            ? '/Vector.svg'
                            : order.status === 'shipped'
                            ? '/Vector-11.svg'
                            : '/check.svg'
                        }
                        className="w-3.5 h-[15px]"
                      />
                      <span>{order.status === 'pending' ? 'Pending' : order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}</span>
                    </div>
                  </div>
                  {/* Buyer Info and Tracking ID */}
                  <div className="flex flex-col gap-4 w-full text-[#6b88b5]">
                    {/* Buyer Details - only show for seller orders */}
                    {activeTab === 'seller' && (
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">Buyer Information:</div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex justify-between">
                            <span>Buyer:</span>
                            <span className="text-gray-800">@{(order as SellerOrder).buyer.farcaster_username}</span>
                          </p>
                          {(order as SellerOrder).buyer.phone_number && (
                            <p className="flex justify-between">
                              <span>Phone:</span>
                              <span className="text-gray-800">{(order as SellerOrder).buyer.phone_number}</span>
                            </p>
                          )}
                          {(order as SellerOrder).buyer.shipping_address && (
                            <>
                              <div className="border-t border-gray-200 my-2" />
                              <div>
                                <span className="block text-sm mb-1">Shipping Address:</span>
                                <p className="text-gray-800 text-sm whitespace-pre-line">{(order as SellerOrder).buyer.shipping_address}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tracking ID */}
                    <div className="flex flex-col gap-2">
                      <div className="text-sm">Tracking ID:</div>
                      <div className="w-full rounded-lg bg-[#f1f1f1] border border-[#989898] flex items-center p-2.5">
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-sm"
                          type="text"
                          value={order.status === 'pending' && activeTab === 'seller' ? trackingNumbers[order.id] || '' : order.tracking_number || ''}
                          onChange={(e) => {
                            if (order.status === 'pending' && activeTab === 'seller') {
                              const value = e.target.value;
                              setTrackingNumbers(prev => ({
                                ...prev,
                                [order.id]: value
                              }));
                            }
                          }}
                          placeholder="Enter tracking ID"
                        />
                        {order.tracking_number && (
                          <button
                            onClick={() => copyToClipboard(order.tracking_number || '')}
                            className="ml-2 p-1 hover:opacity-80 transition-opacity"
                          >
                            <Icon 
                              icon={ICON.COPY} 
                              fontSize={16}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mark as Shipped Button */}
                  {(activeTab === 'seller' && order.status === 'pending') ? (
                    <div>
                      <div className="w-full h-px bg-[#989898] my-2" />
                      <button 
                        className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => markAsShipped(order.id)}
                        disabled={!trackingNumbers[order.id]}
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
                    </div>
                  ) : null}
                      
                  {order.status === 'shipped' && activeTab === 'seller' && (
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

                  {order.status === 'delivered' && activeTab === 'seller' && (
                    <button 
                      className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => markAsCompleted(order.id)}
                      disabled={loading || !context?.user?.fid}
                    >
                      <Image
                        className="w-[22px] h-[18px]"
                        width={22}
                        height={18}
                        alt=""
                        src="/check.svg"
                      />
                      <span className="text-sm font-semibold">
                        Mark as completed
                      </span>
                    </button>
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
