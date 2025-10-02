"use client";

import { Icon } from "@iconify/react";
import Button from "../../ui/Button";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import toast from "react-hot-toast";

interface Props {
  orderId: string;
  onNext: () => void;
  onCloseModal: () => void;
}

interface OrderDetails {
  id: string;
  status: string;
  transaction_hash: string;
  product: {
    id: string;
    title: string;
    price: string;
    photos: string[];
  };
}

function SecurePaymentConfirmed({ orderId, onNext, onCloseModal }: Props) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            transaction_hash,
            product:products!inner (
              id,
              title,
              price,
              photos
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        
        // Extract the first product from the array
        const productData = order.product[0];
        if (!productData) throw new Error('No product data found');

        // Transform the data to match our type
        const transformedOrder: OrderDetails = {
          id: order.id,
          status: order.status,
          transaction_hash: order.transaction_hash,
          product: {
            id: productData.id,
            title: productData.title,
            price: productData.price,
            photos: productData.photos
          }
        };
        
        setOrderDetails(transformedOrder);
        setIsConfirmed(order.status === 'shipped');
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Icon icon={ICON.SPINNER} className="animate-spin text-primary" fontSize={32} />
        <p className="text-gray mt-2">Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Icon icon={ICON.WARNING} className="text-red-500" fontSize={32} />
        <p className="text-gray mt-2">Failed to load order details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-gray text-sm">Secure Payment</p>
      <div
        className={`rounded-[10px] border  border-[#989898] p-5 flex flex-col items-center justify-center gap-1 ${
          isConfirmed ? "bg-white" : "bg-blue-50"
        }`}
      >
        <Icon
          icon={!isConfirmed ? ICON.HISTORY : ICON.PACKAGE}
          fontSize={39}
          className={` ${!isConfirmed ? "text-blue-600" : "text-[#ee7435]!"}`}
        />
        <p className="text-gray font-medium text-[15px]">
          {!isConfirmed ? "Payment Confirmed" : "Item Shipped"}
        </p>
        <p className="text-xs text-[#989898] text-center">
          {!isConfirmed
            ? "Waiting for seller to mark as shipped..."
            : "Track your order and confirm when received"}
        </p>
        <span className="bg-[#f4f2f8] px-4 py-1 rounded-full">
          <p className="text-[#925f21] text-[10px] font-medium">
            Order #{orderDetails.id}
          </p>
        </span>
      </div>
      <div className="rounded-[10px] border border-[#989898] p-5 space-y-3 mt-2">
        <p className="font-medium text-gray text-sm">Order summary</p>

        <div className="border-b border-[#989898] pb-3 flex justify-between items-end gap-x-2">
          <div className="flex gap-x-2">
            <div className="w-9 h-10">
              <Image
                alt={orderDetails.product.title}
                src={orderDetails.product.photos[0]}
                width={36}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-semibold text-gray-light text-sm line-clamp-2">
              {orderDetails.product.title}
            </p>
          </div>
          <p className="text-[#414141] font-semibold text-[15px]">
            ${orderDetails.product.price}
          </p>
        </div>

        <p className="text-[#989898] text-[13px]">
          Transaction:{" "}
          <span className="italic">
            {orderDetails.transaction_hash.slice(0, 18)}...
          </span>
        </p>
      </div>

      <div className="mt-2">
        {!isConfirmed ? (
          <>
            <Button
              variant="tertiary"
              size="xs"
              className="rounded-[10px] font-medium"
              onClick={onCloseModal}
              //   onClick={onNext}
            >
              Request Cancellation
            </Button>
            <p className="text-[8px] text-[#989898]">
              You can cancel this order if the seller doesn’t ship within the
              expected timeframe
            </p>
          </>
        ) : (
          <Button
            variant="back"
            size="xs"
            className="rounded-[10px] font-medium"
            onClick={onCloseModal}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export default SecurePaymentConfirmed;
