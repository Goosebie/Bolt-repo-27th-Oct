export interface TravelBudget {
  transport: string;
  accommodations: string;
  activities: string;
  meals: string;
}

export interface DayItinerary {
  day: number;
  activities: string[];
}

export interface TravelPlanResponse {
  destination: string;
  duration: string;
  budget: TravelBudget | string;
  itinerary: DayItinerary[];
  recommendations: string[];
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateTravelPlan(prompt: string): Promise<TravelPlanResponse>;
}