import { generateTravelPlan as generateWithGroq } from './groq';
import { generateTravelPlan as generateWithMistral } from './mistral';
import { generateTravelPlan as generateWithGemini } from './gemini';

export interface TravelPlanResponse {
  destination: string;
  duration: string;
  budget: string;
  itinerary: Array<{
    day: number;
    activities: string[];
  }>;
  recommendations: string[];
}

export async function generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
  const errors: Error[] = [];

  // Try Groq first
  try {
    return await generateWithGroq(prompt);
  } catch (error) {
    errors.push(error as Error);
  }

  // Try Mistral second
  try {
    return await generateWithMistral(prompt);
  } catch (error) {
    errors.push(error as Error);
  }

  // Try Gemini last
  try {
    return await generateWithGemini(prompt);
  } catch (error) {
    errors.push(error as Error);
  }

  // If all providers fail, throw a comprehensive error
  throw new Error(`All providers failed:\n${errors.map(e => e.message).join('\n')}`);
}