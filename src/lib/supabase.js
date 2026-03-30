import { createClient } from '@supabase/supabase-js'
import { log } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  log.warn('Supabase', 'Credentials missing in .env')
}

const isUrlValid = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const supabase = createClient(
  isUrlValid(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
  isUrlValid(supabaseUrl) ? supabaseAnonKey : 'placeholder'
)
