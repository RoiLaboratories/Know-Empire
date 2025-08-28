'use client';

import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/helpers";
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { confirmDeliveryBySeller, updateOrderStatus } from '@/utils/contractHelpers';
import { useAccount } from 'wagmi';
import { generateTrackingId, copyTrackingId } from '@/utils/tracking';
import Button  from '@/ui/Button';

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  total_amount: number;
  escrow_id: string;
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
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!context?.user?.fid) {
          toast.error('Please connect with Farcaster first');
          return;
        }

        setLoading(true);
        const response = await fetch(`/api/seller/orders?fid=${context.user.fid}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        console.log('Fetched orders:', data); // For debugging
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(refreshOrders, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [context?.user?.fid]); // Re-run when FID changes

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
          fid: context.user.fid 
        })
      });

      if (!response.ok) throw new Error('Failed to update tracking number');
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, tracking_number: trackingNumber }
          : order
      ));

      toast.success('Tracking number updated');
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking number');
    }
  };

  // Mark as shipped
  const markAsShipped = async (orderId: string, escrowId: string) => {
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

      // Generate a unique tracking ID
      const trackingId = generateTrackingId();

      // First confirm delivery in the smart contract
      try {
        await confirmDeliveryBySeller(escrowId);
      } catch (error: any) {
        console.error('Contract error:', error);
        toast.error(error.message || 'Failed to update escrow state');
        return;
      }

      // Update both tracking number and status in the database
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'shipped',
          tracking_number: trackingId,
          fid: context.user.fid 
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'shipped', tracking_number: trackingId }
          : order
      ));

      toast.success('Order marked as shipped and escrow updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add refresh function
  const refreshOrders = async () => {
    if (!context?.user?.fid) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/seller/orders?fid=${context.user.fid}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast.error('Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-screen">
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen">
        <Image
          src="/empty.svg"
          alt="No orders"
          width={200}
          height={200}
        />
        <h3 className="mt-4 text-xl font-semibold">No Orders Yet</h3>
        <p className="mt-2 text-gray-600">Wait for your first order to start managing them here.</p>
      </div>
    );
  }

  return (
    <div className="w-full relative flex flex-row items-center justify-start leading-[normal] tracking-[normal]">
      <section className="h-[874px] flex-1 bg-[#fff] overflow-hidden flex flex-row items-start justify-start py-[71px] px-5 box-border text-left text-[17px] text-[#1a1a1a] font-[Poppins]">
        <div className="flex flex-col items-start justify-start gap-[50px]">
          <div className="flex flex-col items-start justify-start gap-[16.5px]">
            <Image
              className="w-[14.4px] max-h-full z-[2]"
              loading="lazy"
              width={14.4}
              height={12.5}
              alt=""
              src="/Frame-1618869075.svg"
            />
            <div className="w-[266px] flex flex-row items-start justify-end">
              <div className="flex flex-row items-center justify-center">
                <h3 className="m-0 relative text-[length:inherit] font-medium font-[inherit]">
                  Order Management
                </h3>
              </div>
            </div>
          </div>
          <section className="w-[362px] flex flex-col items-center justify-start gap-[25px] z-[1] text-left text-xs text-[#1a1a1a] font-[Poppins]">
            <div className="w-[340px] h-[35px] rounded-[5px] border-[#989898] border-solid border-[1px] box-border flex flex-col items-start justify-start py-1 px-2.5">
              <div className="flex flex-row items-center justify-start gap-[5px]">
                <Image
                  className="w-[22px] relative max-h-full overflow-hidden shrink-0"
                  width={22}
                  height={22}
                  alt=""
                  src="/mingcute-search-line.svg"
                />
                <input
                  className="w-[calc(100%_-_22px)] [border:none] [outline:none] font-[Poppins] text-xs bg-[transparent] relative text-[#989898] text-left inline-block min-w-[55px] p-0"
                  placeholder="Search orders..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center">No orders found</div>
            ) : (
              <div className="w-full space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="self-stretch rounded-[10px] bg-[#fff] border-[#989898] border-solid border-[1px] overflow-hidden flex flex-col items-start justify-start py-[18px] px-[19px] gap-5">
                    <div className="flex flex-col items-start justify-start gap-[9px]">
                      <div className="w-[322px] h-[120px] relative">
                        <Image
                          className="absolute top-[119px] left-[0px] w-[322px] h-px"
                          width={322}
                          height={1}
                          alt=""
                          src="/Vector-1.svg"
                      />
                      <div className="absolute top-[59px] left-[0px] w-[189px] flex flex-row items-center justify-between gap-5">
                        <div className="w-20 flex flex-col items-start justify-start gap-0.5">
                          <div className="self-stretch relative">Order ID</div>
                          <div className="self-stretch relative text-[13px] font-medium">
                            {order.id.slice(0, 8)}...
                          </div>
                        </div>
                        <div className="w-12 flex flex-col items-start justify-start gap-0.5">
                          <div className="self-stretch relative">Amount</div>
                          <div className="self-stretch relative text-[13px] font-medium text-[#16a34a]">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-[0px] left-[0px] w-full h-11 text-[10px]">
                        <div className="absolute top-[0px] left-[245px] flex flex-row items-start justify-start">
                          <div className={`w-[77px] rounded-[10px] ${
                            order.status === 'pending' ? 'bg-[#fef9c3] text-[#925f21]' :
                            order.status === 'shipped' ? 'bg-[#dbeafe] text-[#1e43be]' :
                            'bg-[#dcfce7] text-[#166534]'
                          } flex flex-col items-start justify-start py-[3px] px-1.5 box-border`}>
                            <div className="flex flex-row items-center justify-start gap-[3px]">
                              <Image
                                className="h-[15px] w-[13.9px] relative"
                                width={13.9}
                                height={15}
                                alt=""
                                src={
                                  order.status === 'pending' ? '/Vector.svg' :
                                  order.status === 'shipped' ? '/Vector-2.svg' :
                                  '/check.svg'
                                }
                              />
                              <div className="relative capitalize">{order.status}</div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-[0px] left-[0px] w-full flex flex-row items-start justify-start gap-[5px] h-full text-sm text-[#414141]">
                          <Image
                            className="h-11 w-10 relative object-cover"
                            width={40}
                            height={44}
                            alt={order.product.title}
                            src={order.product.photos[0]}
                          />
                          <div className="w-[140px] relative font-semibold inline-block shrink-0">
                            {order.product.title}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-[322px] flex flex-col items-start justify-start gap-[5px] z-[1] text-[#6b88b5]">
                      <div className="self-stretch relative">Tracking ID:</div>
                      <div className="self-stretch rounded-[5px] bg-[#f1f1f1] border-[#989898] border-solid border-[1px] flex flex-row items-center justify-between p-2.5">
                        <input
                          className="w-full [border:none] [outline:none] bg-[transparent] h-[15px] flex flex-row items-center justify-start font-[Poppins] text-[10px] text-[#989898] min-w-[67px]"
                          placeholder="Enter tracking number"
                          type="text"
                          value={order.tracking_number || ''}
                          onChange={(e) => updateTrackingNumber(order.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {order.status === 'pending' && (
                    <>
                      <Image
                        className="w-[322px] h-px relative max-h-full"
                        width={322}
                        height={1}
                        alt=""
                        src="/Vector-1.svg"
                      />
                      <button 
                        className="cursor-pointer [border:none] pt-[9px] px-5 pb-2 bg-[#2563eb] w-[322px] rounded-[10px] overflow-hidden flex flex-row items-start justify-center box-border disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => markAsShipped(order.id, order.escrow_id)}
                        disabled={loading || !isConnected || !context?.user?.fid}
                      >
                        <div className="flex flex-row items-center justify-start gap-2.5">
                          <Image
                            className="h-[18px] w-[22px] relative"
                            width={22}
                            height={18}
                            alt=""
                            src="/Vector-11.svg"
                          />
                          <div className="relative text-xs font-semibold font-[Poppins] text-[#fff] text-left">
                            Mark as shipped
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
};

export default SellerOrderManagement;
