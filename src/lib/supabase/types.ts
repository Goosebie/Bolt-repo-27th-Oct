export interface TravelPlanRecord {
  id: string;
  user_id: string;
  start_location: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  interests: string[];
  transport_mode: string[];
  plan: Record<string, any>;
  created_at: string;
}

export interface CreateTravelPlanInput {
  user_id: string;
  start_location: string;
  destination?: string;
  start_date: string;
  end_date: string;
  budget: number;
  interests: string[];
  transport_mode: string[];
  plan: Record<string, any>;
}