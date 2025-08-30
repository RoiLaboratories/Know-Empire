-- Add buyer columns to users table
ALTER TABLE public.users
    ADD COLUMN is_buyer boolean default false,
    ADD COLUMN buyer_email text,
    ADD COLUMN buyer_phone text,
    ADD COLUMN buyer_shipping_address text;

-- Add RLS policies for buyer columns
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to update their own buyer information
CREATE POLICY update_buyer_info ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (
            is_buyer = (SELECT is_buyer FROM public.users WHERE id = auth.uid())
            OR is_buyer = true
        )
    );

-- Policy to allow reading buyer information for authenticated users
CREATE POLICY read_buyer_info ON public.users
    FOR SELECT
    USING (auth.uid() = id OR is_buyer = true);
