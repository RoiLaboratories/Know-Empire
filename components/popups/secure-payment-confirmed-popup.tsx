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
      // Create a structured error object that Vercel can parse
      const structuredError = {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        context,
        orderId,
        componentState: {
          isConfirmed,
          hasOrderDetails: !!orderDetails
        },
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : new Error().stack
      };

      // Log directly to stdout/stderr which Vercel captures
      console.error(JSON.stringify({
        level: 'error',
        message: `[SecurePaymentConfirmed][${context}] ${structuredError.message}`,
        error: structuredError
      }));

      // Create an error that maintains the context
      const enhancedError = new Error(`[SecurePaymentConfirmed][${context}] ${structuredError.message}`);
      (enhancedError as any).details = structuredError;
      
      return enhancedError; // Return instead of throwing to allow caller to handle
    };

    const fetchOrderDetails = async () => {
      try {
        if (!orderId) {
          throw logError(new Error('No orderId provided'), 'parameter_validation');
        }
        console.log('SecurePaymentConfirmed: Fetching order details for orderId:', orderId);
      
        console.log('Attempting to fetch order:', orderId);
        
        // First verify if order exists and log table schema
        console.log('Verifying order existence and table schema...');
        const { data: tableInfo } = await supabase
          .from('orders')
          .select('*')
          .limit(1);
        console.log('Orders table structure:', tableInfo);
        
        // Fetch with less strict conditions first to debug
        const { data: allOrders } = await supabase
          .from('orders')
          .select('id')
          .limit(5);
        console.log('Sample orders:', allOrders);
        
        // Now try to fetch our specific order
        const { data: orderCheck, error: orderCheckError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        console.log('Initial order check:', { 
          orderCheck, 
          orderCheckError,
          queriedId: orderId,
          orderIdType: typeof orderId,
          orderIdLength: orderId.length
        });

        if (orderCheckError) {
          console.error('Database error while checking order:', {
            error: orderCheckError,
            orderId,
            timestamp: new Date().toISOString()
          });
          throw logError(orderCheckError, 'fetch_order_check');
        }

        let validOrder = orderCheck;
        if (!validOrder) {
          // Try up to 3 times with increasing delays
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Retry attempt ${attempt} for order ${orderId}`);
            
            // Exponential backoff: 2s, then 4s, then 6s
            const delay = attempt * 2000;
            await new Promise(resolve => setTimeout(resolve, delay));
            
            console.log(`Checking order after ${delay}ms delay...`);
            const { data: retryCheck, error: retryError } = await supabase
              .from('orders')
              .select('id, status, product_id')
              .eq('id', orderId)
              .maybeSingle();

            console.log('Retry check result:', { attempt, retryCheck, retryError });
              
            if (retryCheck) {
              console.log(`Order found on attempt ${attempt}`);
              validOrder = retryCheck;
              break;
            }
            
            if (attempt === 3 || retryError) {
              const noOrderError = new Error(
                `Order with ID ${orderId} not found after ${attempt} attempts. ` +
                `Please wait a moment and try again.`
              );
              const error = logError(noOrderError, 'order_not_found_after_retries');
              toast.error('This order is taking longer than usual to process. Please wait a few seconds and refresh.');
              throw error;
            }
          }
        }

        // Now fetch the full order with product details
        console.log('Fetching full order details...');
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            products!inner (
              *
            )
          `)
          .eq('id', orderId)
          .maybeSingle();
        
        console.log('Full query debug:', {
          orderId,
          orderFound: !!order,
          error,
          rawOrder: order
        });
          
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
          const orderData = { validOrder, fullQuery: 'failed' };
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
      } catch (error: any) {
        // Always show a user-friendly message
        const displayMessage = error?.details?.message || error?.message || 'Unknown error occurred';
        toast.error(`Failed to load order details: ${displayMessage}`);
        
        // Let the error propagate to be caught by Next.js error boundary
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