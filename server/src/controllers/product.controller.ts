import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: product, error } = await supabase
      .from('products')
      .select('*, users!inner(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    const user = (req as any).user; // From auth middleware

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        image_url,
        seller_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url } = req.body;
    const user = (req as any).user;

    // First check if the product belongs to the user
    const { data: existingProduct } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.seller_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this product' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        category,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // First check if the product belongs to the user
    const { data: existingProduct } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.seller_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};
