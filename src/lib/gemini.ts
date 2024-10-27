import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(API_KEY);

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
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    const result = await model.generateContent(`
      ${prompt}
      
      Respond with a JSON object using this exact structure:
      {
        "destination": string,
        "duration": string,
        "budget": string,
        "itinerary": [
          {
            "day": number,
            "activities": string[]
          }
        ],
        "recommendations": string[]
      }

      Make sure to:
      1. Always include all required fields
      2. Format the response as valid JSON
      3. Use proper array structures for itinerary and recommendations
      4. Keep activities and recommendations concise but informative
    `);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    try {
      const parsedResponse = JSON.parse(text);
      
      // Validate the response structure
      if (!parsedResponse.destination || typeof parsedResponse.destination !== 'string') {
        throw new Error('Invalid or missing destination');
      }
      if (!parsedResponse.duration || typeof parsedResponse.duration !== 'string') {
        throw new Error('Invalid or missing duration');
      }
      if (!parsedResponse.budget || typeof parsedResponse.budget !== 'string') {
        throw new Error('Invalid or missing budget');
      }
      if (!Array.isArray(parsedResponse.itinerary)) {
        throw new Error('Invalid or missing itinerary');
      }
      if (!Array.isArray(parsedResponse.recommendations)) {
        throw new Error('Invalid or missing recommendations');
      }

      // Validate itinerary structure
      parsedResponse.itinerary.forEach((day, index) => {
        if (!day.day || typeof day.day !== 'number') {
          throw new Error(`Invalid day number in itinerary at index ${index}`);
        }
        if (!Array.isArray(day.activities)) {
          throw new Error(`Invalid activities array in itinerary at day ${day.day}`);
        }
      });

      return parsedResponse as TravelPlanResponse;
    } catch (parseError) {
      console.error('Failed to parse API response:', text);
      throw new Error(
        parseError instanceof Error 
          ? `Invalid API response format: ${parseError.message}`
          : 'Invalid API response format'
      );
    }
  } catch (apiError) {
    console.error('API request failed:', apiError);
    throw new Error(
      apiError instanceof Error
        ? `Failed to generate travel plan: ${apiError.message}`
        : 'Failed to generate travel plan'
    );
  }
}