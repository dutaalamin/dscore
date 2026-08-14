import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Memastikan variabel lingkungan telah dikonfigurasi dengan benar (bukan nilai placeholder)
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_PROJECT_ID') && 
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

if (!supabase) {
  console.warn(
    'Supabase belum terkonfigurasi pada file .env. Aplikasi DSCORE berjalan dalam mode offline (localStorage-only).'
  );
}
