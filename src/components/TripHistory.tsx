import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { useTripHistory } from '@/hooks/useTripHistory';
import { TravelPlanRecord } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface TripHistoryProps {
  onSelect: (plan: TravelPlanRecord) => void;
  className?: string;
}

export function TripHistory({ onSelect, className }: TripHistoryProps) {
  const { trips, loading, error, toggleFavorite } = useTripHistory();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white/10 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 rounded-lg bg-red-500/10">
        {error}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-gray-400 text-center p-4">
        No previous trips found
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        Previous Trips
      </h3>

      <div className="grid gap-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 
              hover:border-blue-400/30 transition-all duration-200"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium">
                    {trip.origin} <ArrowRight className="w-4 h-4 inline" /> {trip.destination}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(trip.id);
                  }}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Star className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onSelect(trip)}
                className="w-full mt-2 bg-blue-500/20 text-blue-400 py-2 rounded-md
                  hover:bg-blue-500/30 transition-colors"
              >
                View Trip Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}