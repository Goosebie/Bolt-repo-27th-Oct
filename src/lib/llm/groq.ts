import { Groq } from 'groq-sdk';
import { PromptCache } from '../cache/prompt-cache';
import type { TravelPlanResponse } from './types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('Missing VITE_GROQ_API_KEY environment variable');
}

const client = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
  try {
    // Check cache first
    const cached = await PromptCache.get(prompt);
    if (cached) {
      console.log('Using cached response');
      return cached;
    }

    const completion = await client.chat.completions.create({
      model: 'mixtral-8x7b-32768',
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
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9,
      frequency_penalty: 0.2,
      presence_penalty: 0.1
    });

    const text = completion.choices[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from Groq API');
    }

    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || text.match(/\{.*\}/s);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;

    try {
      const parsedResponse = JSON.parse(jsonStr.trim());
      
      // Cache the successful response
      await PromptCache.set(prompt, parsedResponse, 'groq', completion.usage?.total_tokens || 0);
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Raw API response:', text);
      throw new Error('Invalid Groq API response: ' + parseError.message);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      console.warn('Groq rate limit reached, will retry with backoff');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateTravelPlan(prompt);
    }
    console.error('Groq provider failed:', error);
    throw error;
  }
}