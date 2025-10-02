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
    const logError = (error: any, context: string) => {
      // Construct error message with all relevant details
      const errorDetails = {
        timestamp: new Date().toISOString(),
        orderId,
        context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        componentState: {
          isConfirmed,
          hasOrderDetails: !!orderDetails
        }
      };

      // Use Error.captureStackTrace to get proper stack traces
      const enhancedError = new Error(`[SecurePaymentConfirmed][${context}] ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      Error.captureStackTrace(enhancedError, logError);
      
      // Attach details to error object for logging
      (enhancedError as any).details = errorDetails;
      
      // Log full error details
      console.error('SecurePaymentConfirmed Error:', {
        message: enhancedError.message,
        stack: enhancedError.stack,
        details: errorDetails
      });
      
      // Throw the enhanced error to be caught by Next.js
      throw enhancedError;
    };

    const fetchOrderDetails = async () => {
      if (!orderId) {
        logError(new Error('No orderId provided'), 'parameter_validation');
        return;
      }

      try {
        console.log('SecurePaymentConfirmed: Fetching order details for orderId:', orderId);
      
        console.log('Attempting to fetch order:', orderId);
        
        // First fetch just the order to check its existence
        const { data: orderCheck, error: orderCheckError } = await supabase
          .from('orders')
          .select('id, status, product_id')
          .eq('id', orderId)
          .maybeSingle();

        console.log('Initial order check:', { orderCheck, orderCheckError });

        if (orderCheckError) {
          await logError(orderCheckError, 'fetch_order_check');
          throw new Error(`Failed to check order: ${orderCheckError.message}`);
        }

        if (!orderCheck) {
          const noOrderError = new Error(`Order with ID ${orderId} not found`);
          await logError(noOrderError, 'order_not_found');
          throw noOrderError;
        }

        // Now fetch the full order with product details
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            product_id,
            product:products (
              id,
              title,
              price,
              photos
            )
          `)
          .eq('id', orderId)
          .maybeSingle();
          
        console.log('Full order response:', { 
          order,
          error,
          hasProduct: order?.product !== null,
          productData: order?.product
        });

        if (error) {
          await logError(error, 'fetch_order_details');
          throw new Error(`Failed to fetch order details: ${error.message}`);
        }

        if (!order) {
          const orderData = { orderCheck, fullQuery: 'failed' };
          const nullOrderError = new Error(`Order data is null or undefined after successful check. Order ID: ${orderId}`);
          await logError({ ...nullOrderError, orderData }, 'validate_order_data');
          throw nullOrderError;
        }

        console.log('SecurePaymentConfirmed: Raw order data:', JSON.stringify(order, null, 2));

        // Log the state of the order and product data
        console.log('Order data check:', {
          hasOrder: !!order,
          orderId: order.id,
          hasProductField: 'product' in order,
          productValue: order.product,
          productId: order.product_id
        });

        if (!order.product) {
          const noProductError = new Error(`Product data not found in order. Order ID: ${order.id}, Product ID: ${order.product_id}`);
          logError({ 
            error: noProductError,
            orderData: {
              id: order.id,
              status: order.status,
              product_id: order.product_id,
              rawProduct: order.product
            }
          }, 'validate_product_data');
          throw noProductError;
        }

        // Ensure we have a product array and get the first item
        const productData = Array.isArray(order.product) ? order.product[0] : order.product;
        
        console.log('Product data check:', {
          hasProductData: !!productData,
          productFields: productData ? Object.keys(productData) : null,
          rawProductData: productData
        });

        if (!productData) {
          const invalidProductError = new Error('Product data is missing or invalid');
          logError({
            error: invalidProductError,
            productData: order.product
          }, 'validate_product_structure');
          throw invalidProductError;
        }

        console.log('SecurePaymentConfirmed: Product data:', JSON.stringify(productData, null, 2));

        // Transform the data to match our type with validation
        const transformedOrder: OrderDetails = {
          id: order.id || '',
          status: order.status || 'pending',
          product: {
            id: productData.id || '',
            title: productData.title || '',
            price: productData.price || '0',
            photos: Array.isArray(productData.photos) ? productData.photos : []
          }
        };

        console.log('Transformed order:', transformedOrder); // Log the final transformed data
        
        setOrderDetails(transformedOrder);
        setIsConfirmed(order.status === 'shipped');
      } catch (error) {
        // Log errors in a way that ensures they appear in Vercel logs
        console.error('SecurePaymentConfirmed Fetch Error:', {
          orderId,
          error: error instanceof Error ? error.message : error,
          state: {
            isConfirmed,
            hasOrderDetails: !!orderDetails,
            isLoading
          }
        });
        
        // Re-throw the error to be caught by React error boundary
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to load order details: ${errorMessage}`);
        throw error;
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
          Order ID:{" "}
          <span className="italic">
            {orderDetails.id}
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
            >
              Request Cancellation
            </Button>
            <p className="text-[8px] text-[#989898]">
              You can cancel this order if the seller doesn't ship within the
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