import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          created_at
        ),
        orders (
          id,
          status,
          created_at,
          products (
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq('farcaster_username', username)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // From auth middleware
    const { bio, website, social_links } = req.body;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        bio,
        website,
        social_links,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error updating user profile' });
  }
};

export const getUserProducts = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        users!inner (
          id,
          farcaster_username,
          display_name,
          avatar_url
        )
      `)
      .eq('users.farcaster_username', username)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Error fetching user products' });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // From auth middleware

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          seller:users!inner (
            id,
            farcaster_username,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching user orders' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Get user first to verify they exist and get their ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('farcaster_username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stats in parallel
    const [productsCount, ordersCount, totalSales] = await Promise.all([
      // Count total products
      supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id),
      
      // Count total orders received
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id),
      
      // Sum total sales
      supabase
        .from('orders')
        .select('total_amount')
        .eq('seller_id', user.id)
        .eq('status', 'completed')
    ]);

    const totalSalesAmount = totalSales.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    res.json({
      total_products: productsCount.count || 0,
      total_orders: ordersCount.count || 0,
      total_sales: totalSalesAmount
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Error fetching user stats' });
  }
};
