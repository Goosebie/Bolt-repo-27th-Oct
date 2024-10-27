import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL environment variable');
if (!supabaseKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  // Add this to force schema refresh
  headers: {
    'Prefer': 'count=exact'
  }
});