-- Add isPaid column to orders table with default value of false
ALTER TABLE orders
ADD COLUMN is_paid BOOLEAN DEFAULT false NOT NULL;

-- Set comment for the column
COMMENT ON COLUMN orders.is_paid IS 'Indicates whether the order has been paid';

-- Add a function to update is_paid
CREATE OR REPLACE FUNCTION update_order_payment_status(
  order_id UUID,
  new_status BOOLEAN
) RETURNS void AS $$
BEGIN
  UPDATE orders
  SET is_paid = new_status,
      updated_at = NOW()
  WHERE id = order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
