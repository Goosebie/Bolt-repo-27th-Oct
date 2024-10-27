export interface TravelFormData {
  startDate: string;
  endDate: string;
  budget: string;
  interests: string;
  origin: string;
  destination?: string;
  transportMode: string | string[];
  tripType: 'one-way' | 'return';
}

export interface TravelPlanResponse {
  destination: string;
  duration: string;
  budget: {
    flights: string;
    accommodations: string;
    activities: string;
    meals: string;
  };
  itinerary: Array<{
    day: number;
    activities: string[];
  }>;
  recommendations: string[];
}