import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing VITE_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    `);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // Extract JSON from the response (handling potential markdown code blocks)
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/\{.*\}/s);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    try {
      const parsedResponse = JSON.parse(jsonStr.trim());
      return parsedResponse;
    } catch (parseError) {
      console.error('Raw API response:', text);
      throw new Error('Invalid Gemini API response: ' + parseError.message);
    }
  } catch (error) {
    console.error('Gemini provider failed:', error);
    throw error;
  }
}