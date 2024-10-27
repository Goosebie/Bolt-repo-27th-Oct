import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TravelPlanRecord } from '@/lib/supabase/types';

export function useTripHistory(userId: string = 'guest') {
  const [trips, setTrips] = useState<TravelPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTripHistory();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('trip_history_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'trip_history' 
      }, (payload) => {
        loadTripHistory();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadTripHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trip_history')
        .select(`
          *,
          travel_plan:travel_plans(*)
        `)
        .eq('user_id', userId)
        .order('selected_at', { ascending: false });

      if (error) throw error;

      setTrips(data.map(item => item.travel_plan));
      
      // Sync with local storage
      localStorage.setItem('tripHistory', JSON.stringify(data));
    } catch (err) {
      console.error('Error loading trip history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trip history');
      
      // Try to load from local storage as fallback
      const cached = localStorage.getItem('tripHistory');
      if (cached) {
        setTrips(JSON.parse(cached).map((item: any) => item.travel_plan));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (plan: TravelPlanRecord) => {
    try {
      const { error } = await supabase
        .from('trip_history')
        .upsert({
          user_id: userId,
          travel_plan_id: plan.id,
          selected_at: new Date().toISOString()
        });

      if (error) throw error;
      await loadTripHistory();
    } catch (err) {
      console.error('Error adding to history:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to history');
    }
  };

  const toggleFavorite = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('trip_history')
        .update({ is_favorite: true })
        .eq('travel_plan_id', planId)
        .eq('user_id', userId);

      if (error) throw error;
      await loadTripHistory();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to update favorite status');
    }
  };

  return {
    trips,
    loading,
    error,
    addToHistory,
    toggleFavorite,
    refresh: loadTripHistory
  };
}