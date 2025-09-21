"use client";

import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { formatCurrency } from "@/utils/helpers";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { confirmDeliveryBySeller } from "@/utils/contractHelpers";
import { useAccount } from "wagmi";
import Button from "@/ui/Button";
import BackButton from "@/ui/BackButton";
import { Icon } from "@iconify/react";
import { ICON } from "@/utils/icon-export";
import LoadingCard from "@/components/popups/loading-card";

interface SellerOrder {
  id: string;
  status: "pending" | "shipped" | "delivered" | "completed" | "cancelled";
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
  seller: {
      username: string;
      wallet_address: string;
    };
}

// Simple type for tracking ID updates
type TrackingIds = { [orderId: string]: string };

interface BuyerOrder {
  id: string;
  status: "pending" | "shipped" | "delivered" | "completed" | "cancelled";
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
  // State management
  const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveringLoading, setDeliveringLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<
    Array<SellerOrder | BuyerOrder>
  >([]);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
    {}
  );

  // Hooks
  const { context } = useMiniKit();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Setup component with context and connection state
  useEffect(() => {
    if (!isConnected || !context?.user?.fid) {
      setLoading(false);
    }
  }, [isConnected, context?.user?.fid]);

  const fetchOrders = useCallback(async () => {
    if (!context?.user?.fid) {
      toast.error("Please connect your Farcaster account");
      setLoading(false);
      return;
    }
    if (!isConnected) {
      toast.error("Please connect your wallet");
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      setLoading(true);

      // Fetch seller orders first
      const sellerResponse = await fetch(
        `/api/seller/orders?fid=${context.user.fid}`
      );
      if (!sellerResponse.ok) {
        throw new Error(
          `Failed to fetch seller orders: ${sellerResponse.statusText}`
        );
      }
      const sellerData: SellerOrder[] = await sellerResponse.json();
      setSellerOrders(sellerData || []);

      // Then fetch buyer orders
      const buyerResponse = await fetch(
        `/api/buyer/orders?fid=${context.user.fid}`
      );
      if (!buyerResponse.ok) {
        throw new Error(
          `Failed to fetch buyer orders: ${buyerResponse.statusText}`
        );
      }
      const buyerData: BuyerOrder[] = await buyerResponse.json();
      setBuyerOrders(buyerData || []);

      // Update orders
      setSellerOrders(sellerData);
      setBuyerOrders(buyerData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address && context?.user?.fid) {
      fetchOrders();
    }
  }, [isConnected, address, context?.user?.fid, fetchOrders]);

  // Debug logging for tracking ID state
  useEffect(() => {
    filteredOrders.forEach((order) => {
      console.log("[Tracking ID Debug]", {
        activeTab,
        status: order.status,
        id: order.id,
        isSeller: activeTab === "seller",
        isPending: order.status === "pending",
      });
    });
  }, [activeTab, filteredOrders]);

  useEffect(() => {
    // Update filtered orders based on active tab and search term
    const orders = activeTab === "seller" ? sellerOrders : buyerOrders;

    // Cast orders array based on active tab
    const filtered = orders.filter((order) => {
      const title = order.product.title.toLowerCase();
      const id = order.id.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return title.includes(searchLower) || id.includes(searchLower);
    });

    // Explicitly type the filtered orders based on active tab
    setFilteredOrders(
      activeTab === "seller"
        ? (filtered as SellerOrder[])
        : (filtered as BuyerOrder[])
    );
  }, [activeTab, sellerOrders, buyerOrders, searchTerm]);

  const copyToClipboard = useCallback((text: string | null) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }, []);



  const markAsShipped = useCallback(
    async (orderId: string) => {
      try {
        setShippingLoading(true);
        const trackingNumber = trackingInputs[orderId]?.trim();

        console.log("[Mark as Shipped] Starting request:", {
          orderId,
          trackingNumber,
          fid: context?.user?.fid
        });

        if (!context?.user?.fid) {
          toast.error("Please connect your Farcaster account");
          return;
        }

        if (!trackingNumber) {
          toast.error("Please enter a tracking ID first");
          return;
        }

        // First update the tracking number
        const trackingResponse = await fetch(`/api/seller/orders/${orderId}/tracking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tracking_number: trackingNumber,
            fid: context.user.fid
          }),
        });

        console.log("[Mark as Shipped] Tracking response status:", trackingResponse.status);

        if (!trackingResponse.ok) {
          const errorText = await trackingResponse.text();
          console.error("[Mark as Shipped] Tracking error response:", {
            status: trackingResponse.status,
            statusText: trackingResponse.statusText,
            error: errorText
          });
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText);
          } catch (e) {
            throw new Error(errorText || "Failed to update tracking number");
          }
        }

        // Then update the status to shipped
        const statusResponse = await fetch(`/api/seller/orders/${orderId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "shipped",
            tracking_number: trackingNumber,
            fid: context.user.fid
          }),
        });

        console.log("[Mark as Shipped] Status response status:", statusResponse.status);

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error("[Mark as Shipped] Status error response:", {
            status: statusResponse.status,
            statusText: statusResponse.statusText,
            error: errorText
          });
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText);
          } catch (e) {
            throw new Error(errorText || "Failed to update order status");
          }
        }

        const result = await statusResponse.json();
        console.log("[Mark as Shipped] Success:", result);

        // Only clear the tracking input if the API call was successful
        setTrackingInputs((prev) => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });

        toast.success("Order marked as shipped!");
        await fetchOrders();
      } catch (error) {
        console.error("[Mark as Shipped] Caught error:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to mark order as shipped"
        );
      } finally {
        setShippingLoading(false);
      }
    },
    [trackingInputs, fetchOrders, context?.user?.fid]
  );

  const markAsDelivered = useCallback(
    async (orderId: string, escrowId: string) => {
      try {
        setDeliveringLoading(true);
        console.log("[Mark as Delivered] Starting request:", { orderId, escrowId, fid: context?.user?.fid });

        if (!context?.user?.fid) {
          toast.error("Please connect your Farcaster account");
          return;
        }

        if (!isConnected) {
          toast.error("Please connect your wallet");
          return;
        }

        const response = await fetch(`/api/seller/orders/${orderId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            status: "delivered",
            fid: context.user.fid
          }),
        });

        console.log("[Mark as Delivered] API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Mark as Delivered] API error response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText);
          } catch (e) {
            throw new Error(errorText || "Failed to update order status");
          }
        }

        const result = await response.json();
        console.log("[Mark as Delivered] API success:", result);

        // Call smart contract
        console.log("[Mark as Delivered] Calling smart contract with escrowId:", escrowId);
        await confirmDeliveryBySeller(escrowId);
        console.log("[Mark as Delivered] Smart contract call successful");

        toast.success("Order marked as delivered!");
        await fetchOrders();
      } catch (error) {
        console.error("[Mark as Delivered] Error:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to mark order as delivered"
        );
      } finally {
        setDeliveringLoading(false);
      }
    },
    [fetchOrders, context?.user?.fid, isConnected]
  );

  const markAsCompleted = useCallback(
    async (orderId: string) => {
      try {
        const response = await fetch(`/api/seller/orders/${orderId}/complete`, {
          method: "POST",
        });
        if (!response.ok) throw new Error("Failed to mark as completed");
        toast.success("Order marked as completed!");
        fetchOrders();
      } catch (error) {
        console.error("Error marking order as completed:", error);
        toast.error("Failed to mark order as completed");
      }
    },
    [fetchOrders]
  );

  // Your existing fetchOrders and other functions...

  return (
    <section className="min-h-screen bg-white">
      {/* Loading States */}
      {shippingLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <LoadingCard message="Marking order as shipped..." />
        </div>
      )}
      {deliveringLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <LoadingCard message="Marking order as delivered..." />
        </div>
      )}
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
                <BackButton onClick={() => router.push("/marketplace")} />
              </div>
              <div className="flex justify-center">
                <h1 className="text-xl font-bold">Order Management</h1>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("seller")}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === "seller"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Sales
              </button>
              <button
                onClick={() => setActiveTab("buyer")}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === "buyer"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Purchases
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder={`Search ${
                  activeTab === "seller"
                    ? "orders to fulfill"
                    : "your purchases"
                } by title or ID...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#989898] text-sm outline-none"
              />
            </div>
          </div>

          {!isConnected || !context?.user?.fid ? (
            <div className="text-center py-8">
              Please connect your wallet and Farcaster account
            </div>
          ) : loading ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <LoadingCard message="Loading orders..." />
            </div>
          ) : (activeTab === "seller" ? sellerOrders : buyerOrders).length ===
            0 ? (
            <div className="text-center py-8">
              No {activeTab === "seller" ? "sales" : "purchases"} found
            </div>
          ) : filteredOrders.length === 0 && searchTerm ? (
            <div className="text-center py-8">No orders match your search</div>
          ) : (
            <div className="w-full space-y-4">
              {filteredOrders.map((order: SellerOrder | BuyerOrder) => (
                <div
                  key={order.id}
                  className="w-full rounded-lg bg-white border border-[#989898] p-4 flex flex-col gap-4"
                >
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
                        {activeTab === "buyer" && (
                          <div className="text-xs text-gray-500">
                            Seller: @
                            {
                              (order as unknown as BuyerOrder).product.user
                                .farcaster_username
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                        order.status === "pending"
                          ? "bg-[#fef9c3] text-[#925f21]"
                          : order.status === "shipped"
                          ? "bg-[#dbeafe] text-[#1e43be]"
                          : order.status === "delivered"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : order.status === "completed"
                          ? "bg-[#dcfce7] text-[#15803d]"
                          : order.status === "cancelled"
                          ? "bg-[#fee2e2] text-[#991b1b]"
                          : "bg-[#fef9c3] text-[#925f21]"
                      }`}
                    >
                      <img
                        width={14}
                        height={15}
                        alt=""
                        src="/Vector.svg"
                        className="w-3.5 h-[15px]"
                      />
                      <span>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>

                    {/* Buyer Info and Tracking ID */}
                  <div className="flex flex-col gap-4 w-full text-[#6b88b5]">
                    {/* Buyer Details - only show for seller orders */}
                    {activeTab === "seller" && (
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">
                          Buyer Information:
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="flex justify-between">
                            <span>Buyer:</span>
                            <span className="text-gray-800">
                              @{(order as SellerOrder).buyer.farcaster_username}
                            </span>
                          </p>
                          {(order as SellerOrder).buyer.phone_number && (
                            <p className="flex justify-between">
                              <span>Phone:</span>
                              <span className="text-gray-800">
                                {(order as SellerOrder).buyer.phone_number}
                              </span>
                            </p>
                          )}
                          {(order as SellerOrder).buyer.shipping_address && (
                            <>
                              <div className="border-t border-gray-200 my-2" />
                              <div>
                                <span className="block text-sm mb-1">
                                  Shipping Address:
                                </span>
                                <p className="text-gray-800 text-sm whitespace-pre-line">
                                  {
                                    (order as SellerOrder).buyer
                                      .shipping_address
                                  }
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tracking ID */}
                    <div className="flex flex-col gap-2 w-full text-[#6b88b5]">
                      <div className="text-sm">Tracking ID:</div>
                      <div className="w-full rounded-lg bg-[#f1f1f1] border border-[#989898] flex items-center p-2.5">
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-sm text-[#414141]"
                          type="text"
                          placeholder="Enter tracking number"
                          value={
                            order.status.toLowerCase() === 'pending'
                              ? trackingInputs[order.id] || ''
                              : order.tracking_number || ''
                          }
                          onChange={(e) => {
                            setTrackingInputs(prev => ({
                              ...prev,
                              [order.id]: e.target.value
                            }));
                          }}
                          disabled={order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered'}
                        />
                        {order.tracking_number && order.status.toLowerCase() !== 'pending' && (
                          <button
                            onClick={() => copyToClipboard(order.tracking_number!)}
                            className="ml-2 p-1 hover:opacity-80 transition-opacity"
                          >
                            <Icon 
                              icon={ICON.COPY} 
                              width={20} 
                              height={20}
                              className="text-gray-600"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>                    {/* Action buttons */}
                    {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'delivered') && (
                    <>
                      <div className="w-full h-px bg-[#989898] my-2" />

                      {order.status.toLowerCase() === 'pending' && (
                        <button 
                          className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => markAsShipped(order.id)}
                          disabled={!trackingInputs[order.id]?.trim() || shippingLoading || !context?.user?.fid}
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

                      {order.status.toLowerCase() === 'shipped' && (
                        <button 
                          className="w-full flex items-center justify-center gap-2.5 bg-[#2563eb] text-white rounded-lg py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => markAsDelivered(order.id, order.escrow_id)}
                          disabled={deliveringLoading || !isConnected || !context?.user?.fid}
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

                      {order.status.toLowerCase() === 'delivered' && (
                        <>
                          <button 
                            className="w-full flex items-center justify-center gap-2.5 bg-[#ef4444] text-white rounded-lg py-2.5 px-5 mb-2"
                            onClick={() => router.push(`/raise-dispute?orderId=${order.id}`)}
                          >
                            <span className="text-sm font-semibold">
                              Raise a dispute
                            </span>
                          </button>
                          {!(order as SellerOrder).is_paid && (
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




