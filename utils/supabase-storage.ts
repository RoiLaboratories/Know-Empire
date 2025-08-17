import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadProductImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  try {
    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const uploadMultipleProductImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadProductImage(file))
    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}
