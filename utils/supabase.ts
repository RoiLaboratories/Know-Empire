import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
}

// Create a Supabase client with the anon key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

// Service role client should only be used in API routes
export const createServiceClient = () => {
  if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  
  return createClient(supabaseUrl, supabaseServiceKey, options)
}
