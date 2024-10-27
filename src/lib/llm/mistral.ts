import MistralClient from '@mistralai/mistralai';

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

if (!MISTRAL_API_KEY) {
  throw new Error('Missing VITE_MISTRAL_API_KEY environment variable');
}

const client = new MistralClient(MISTRAL_API_KEY);

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
    const response = await client.chat({
      model: 'mistral-medium',
      messages: [
        {
          role: 'system',
          content: 'You are a travel planning expert. Provide detailed travel plans in JSON format.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nRespond with a JSON object using this exact structure:\n{
            "destination": string,
            "duration": string,
            "budget": string,
            "itinerary": [{ "day": number, "activities": string[] }],
            "recommendations": string[]
          }`
        }
      ]
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from Mistral API');
    }

    // Extract JSON from the response (handling potential markdown code blocks)
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/\{.*\}/s);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    try {
      const parsedResponse = JSON.parse(jsonStr.trim());
      return parsedResponse;
    } catch (parseError) {
      console.error('Raw API response:', text);
      throw new Error('Invalid Mistral API response: ' + parseError.message);
    }
  } catch (error) {
    console.error('Mistral provider failed:', error);
    throw error;
  }
}