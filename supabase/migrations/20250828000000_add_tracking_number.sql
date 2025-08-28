-- Add new columns to the orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

-- Add comment to tracking_number column
COMMENT ON COLUMN public.orders.tracking_number IS 'Unique tracking ID for shipped orders (format: KE-YYYY-XXXX-XXXX)';

-- Add comment to shipped_at column
COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when the order was marked as shipped';

-- Add comment to delivered_at column
COMMENT ON COLUMN public.orders.delivered_at IS 'Timestamp when the order was marked as delivered';

-- Add an index on tracking_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- Add a unique constraint to ensure tracking numbers are unique
ALTER TABLE public.orders ADD CONSTRAINT uq_orders_tracking_number UNIQUE (tracking_number);
