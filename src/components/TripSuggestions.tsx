import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, MapPin, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import type { TravelPlanResponse } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TripSuggestionsProps {
  suggestions: TravelPlanResponse[];
  onSelect: (plan: TravelPlanResponse) => void;
  budget: number;
  onBack?: () => void;
}

export function TripSuggestions({ suggestions, onSelect, budget, onBack }: TripSuggestionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const planBudget = parseFloat(suggestion.budget.replace(/[^0-9.]/g, ''));
      return !isNaN(planBudget) && planBudget <= budget;
    });
  }, [suggestions, budget]);

  if (filteredSuggestions.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center space-y-4">
        <p className="text-white">
          No trips found within your budget of ${budget}. Try adjusting your budget or preferences.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Trip Suggestions
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredSuggestions.map((suggestion, index) => (
          <div
            key={index}
            className={cn(
              "bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden transition-all duration-200",
              "border border-white/10 hover:border-blue-400/30",
              expandedIndex === index && "ring-2 ring-blue-400"
            )}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full text-left p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">
                    {suggestion.destination}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {suggestion.duration}
                  </p>
                </div>
              </div>
              {expandedIndex === index ? (
                <ChevronDown className="w-5 h-5 text-blue-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-blue-400" />
              )}
            </button>

            {expandedIndex === index && (
              <div className="p-4 border-t border-white/10 animate-slide-up">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{suggestion.budget}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Highlights</h4>
                    <div className="grid gap-2">
                      {suggestion.itinerary.slice(0, 3).map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <p className="text-sm font-medium text-gray-400 mb-1">
                            Day {day.day}
                          </p>
                          <ul className="space-y-1">
                            {day.activities.map((activity, actIndex) => (
                              <li
                                key={actIndex}
                                className="text-sm text-gray-300 flex items-start gap-2"
                              >
                                <MapPin className="w-3 h-3 mt-1 flex-shrink-0 text-blue-400" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(suggestion)}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg
                      hover:bg-blue-600 transition-colors duration-200"
                  >
                    Select This Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}