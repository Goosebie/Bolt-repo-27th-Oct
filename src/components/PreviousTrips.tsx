import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { TravelPlanRecord } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

interface PreviousTripsProps {
  trips: TravelPlanRecord[];
  onSelect: (trip: TravelPlanRecord) => void;
  className?: string;
}

export function PreviousTrips({ trips, onSelect, className }: PreviousTripsProps) {
  if (trips.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-white">Previous Trips</h3>
      <div className="grid gap-3">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => onSelect(trip)}
            className="w-full text-left p-4 bg-white/10 backdrop-blur-sm rounded-lg
              border border-white/10 hover:border-blue-400/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-white">
                    {trip.origin} <ArrowRight className="w-4 h-4 inline" /> {trip.destination}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}