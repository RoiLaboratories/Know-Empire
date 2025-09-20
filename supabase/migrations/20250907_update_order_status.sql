-- Update the orders status enum to include all stages
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add status check constraint with all stages
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'shipped', 'delivered', 'completed', 'cancelled'));
