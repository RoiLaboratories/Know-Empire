-- Create a secure RPC to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status_rpc(
  order_id UUID,
  new_status BOOLEAN DEFAULT true
) RETURNS BOOLEAN AS $$
DECLARE
  seller_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the seller_id from the order's product
  SELECT p.seller_id INTO seller_id
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.id = order_id;

  -- Get the current user's ID
  current_user_id := auth.uid();

  -- Verify the current user is the seller
  IF seller_id != current_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Only the seller can update payment status';
  END IF;

  -- Update the payment status
  PERFORM update_order_payment_status(order_id, new_status);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
