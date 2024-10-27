import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
if (!supabaseKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function saveTravelPlans(plans: any[]) {
  try {
    const { data, error } = await supabase
      .from('travel_plans')
      .insert(plans)
      .select();

    if (error) {
      console.error('Error saving travel plans:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to save travel plans:', error);
    throw error;
  }
}

export async function getTravelPlans(userId: string) {
  try {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching travel plans:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch travel plans:', error);
    throw error;
  }
}