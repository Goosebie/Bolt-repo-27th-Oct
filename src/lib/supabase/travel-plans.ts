import { supabase } from './client';
import type { CreateTravelPlanInput, TravelPlanRecord } from './types';

export async function createTravelPlan(input: CreateTravelPlanInput): Promise<TravelPlanRecord> {
  const { data, error } = await supabase
    .from('travel_plans')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating travel plan:', error);
    throw new Error('Failed to save travel plan');
  }

  return data;
}

export async function getTravelPlans(userId: string): Promise<TravelPlanRecord[]> {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching travel plans:', error);
    throw new Error('Failed to fetch travel plans');
  }

  return data;
}

export async function getTravelPlan(id: string): Promise<TravelPlanRecord> {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching travel plan:', error);
    throw new Error('Failed to fetch travel plan');
  }

  return data;
}