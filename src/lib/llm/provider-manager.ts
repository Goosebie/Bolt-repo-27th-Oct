import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { MistralProvider } from './mistral';
import { PromptCache } from '@/lib/cache/prompt-cache';
import type { LLMProvider, TravelPlanResponse } from './types';

export class LLMProviderManager {
  private providers: LLMProvider[];
  private currentProviderIndex: number = 0;

  constructor() {
    this.providers = [
      new GroqProvider(),
      new MistralProvider(),
      new GeminiProvider(),
    ].filter(provider => provider.isAvailable());

    if (this.providers.length === 0) {
      throw new Error('No LLM providers available. Please configure at least one API key.');
    }

    // Clean up expired cache entries on initialization
    PromptCache.cleanup().catch(console.error);

    console.log('Available providers:', this.providers.map(p => p.name).join(', '));
  }

  async generateTravelPlan(prompt: string): Promise<TravelPlanResponse> {
    // Check token usage before proceeding
    const dailyTokens = await PromptCache.getDailyTokenUsage();
    if (dailyTokens >= 100000) {
      console.warn('Daily token limit reached. Using cached responses only.');
      const cached = await PromptCache.get(prompt);
      if (cached) return cached;
      throw new Error('Token limit reached and no cached response available');
    }

    // Try to get cached response first
    const cached = await PromptCache.get(prompt);
    if (cached) {
      console.log('Using cached response');
      return cached;
    }

    const errors: Error[] = [];
    const startIndex = this.currentProviderIndex;

    // Try each provider until one succeeds
    do {
      const provider = this.providers[this.currentProviderIndex];
      
      try {
        console.log(`Attempting with ${provider.name}...`);
        const result = await provider.generateTravelPlan(prompt);
        
        // Estimate token count (rough approximation)
        const tokenCount = this.estimateTokenCount(prompt, result);
        
        // Cache successful response with token count
        await PromptCache.set(prompt, result, provider.name, tokenCount);
        
        console.log(`${provider.name} succeeded`);
        return result;
      } catch (error) {
        console.error(`${provider.name} failed:`, error);
        errors.push(error instanceof Error ? error : new Error('Unknown error'));
        
        // Move to next provider
        this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      }
    } while (this.currentProviderIndex !== startIndex);

    // If all providers failed, throw a detailed error
    const errorDetails = errors.map((e, i) => 
      `${this.providers[i].name}: ${e.message}`
    ).join('\n');
    
    throw new Error(`All providers failed:\n${errorDetails}`);
  }

  private estimateTokenCount(prompt: string, response: TravelPlanResponse): number {
    // Rough estimation: ~1.3 tokens per word
    const promptTokens = prompt.split(/\s+/).length * 1.3;
    const responseTokens = JSON.stringify(response).split(/\s+/).length * 1.3;
    return Math.ceil(promptTokens + responseTokens);
  }
}