import { useState } from 'react';
import * as groq from '../lib/llm/groq';
import * as mistral from '../lib/llm/mistral';
import * as gemini from '../lib/llm/gemini';
import { supabase } from '../lib/supabase/client';
import { TravelFormData } from '../components/TravelForm';
import { TravelPlanResponse } from '../lib/types';
import { differenceInDays, format } from 'date-fns';

export function useTravelPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<TravelPlanResponse[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TravelPlanResponse | null>(null);
  const [origin, setOrigin] = useState<string>('');

  const generatePlan = async (formData: TravelFormData) => {
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const duration = differenceInDays(endDate, startDate);

      if (duration < 1) {
        throw new Error('End date must be after start date');
      }

      const prompt = `
        As an expert travel planner, suggest the perfect destination and create a detailed ${duration}-day itinerary based on these preferences:
        
        Origin: ${formData.origin}
        Travel Dates: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}
        Total Budget: $${formData.budget} USD
        Transport Mode: ${Array.isArray(formData.transportMode) ? formData.transportMode.join(', ') : formData.transportMode}
        Trip Type: ${formData.tripType}
        Traveler Interests: ${formData.interests}

        Important considerations:
        - Seasonal weather and activities for the specified dates
        - Complete budget breakdown (flights, accommodations, activities, meals)
        - Alignment with traveler's interests and preferences
        - Current travel conditions and destination accessibility
        - Local events or festivals during the travel period
      `;

      // Try each LLM provider in sequence until one succeeds
      let plan: TravelPlanResponse | null = null;
      let error: Error | null = null;

      try {
        plan = await groq.generateTravelPlan(prompt);
      } catch (e) {
        console.error('Groq provider failed:', e);
        error = e as Error;
      }

      if (!plan) {
        try {
          plan = await mistral.generateTravelPlan(prompt);
        } catch (e) {
          console.error('Mistral provider failed:', e);
          error = e as Error;
        }
      }

      if (!plan) {
        try {
          plan = await gemini.generateTravelPlan(prompt);
        } catch (e) {
          console.error('Gemini provider failed:', e);
          error = e as Error;
        }
      }

      if (!plan) {
        throw error || new Error('All providers failed to generate a travel plan');
      }

      await saveTravelPlan(formData, plan);
      setPlans(prevPlans => [...prevPlans, plan!]);
      setOrigin(formData.origin);
      setSelectedPlan(plan);

    } catch (err) {
      console.error('Error generating travel plans:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to generate travel suggestions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const saveTravelPlan = async (formData: TravelFormData, plan: TravelPlanResponse) => {
    try {
      const { error: verifyError } = await supabase
        .from('travel_plans')
        .select('id')
        .limit(1);

      if (verifyError) {
        console.error('Table verification failed:', verifyError);
        throw new Error('Database schema verification failed');
      }

      const { error: saveError } = await supabase
        .from('travel_plans')
        .insert([{
          user_id: 'guest',
          origin: formData.origin,
          destination: plan.destination,
          start_date: formData.startDate,
          end_date: formData.endDate,
          budget: parseFloat(formData.budget),
          interests: formData.interests,
          transport_mode: formData.transportMode,
          trip_type: formData.tripType,
          plan
        }]);

      if (saveError) {
        console.error('Supabase error:', saveError);
        throw new Error(`Failed to save travel plan: ${saveError.message}`);
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      throw error;
    }
  };

  const selectPlan = (plan: TravelPlanResponse) => {
    setSelectedPlan(plan);
  };

  return { generatePlan, loading, error, plans, selectedPlan, selectPlan, origin };
}