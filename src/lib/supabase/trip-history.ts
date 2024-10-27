import { supabase } from './client';

export async function trackTripSelection(userId: string, travelPlanId: string) {
  const { error } = await supabase
    .from('trip_history')
    .upsert({
      user_id: userId,
      travel_plan_id: travelPlanId,
      selected_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error tracking trip selection:', error);
    throw new Error('Failed to track trip selection');
  }
}

export async function getRecentTrips(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('trip_history')
    .select(`
      *,
      travel_plans (*)
    `)
    .eq('user_id', userId)
    .order('selected_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent trips:', error);
    throw new Error('Failed to fetch recent trips');
  }

  return data;
}

export async function clearTripHistory(userId: string) {
  const { error } = await supabase
    .from('trip_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing trip history:', error);
    throw new Error('Failed to clear trip history');
  }
}