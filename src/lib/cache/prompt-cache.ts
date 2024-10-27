import { supabase } from '../supabase/client';
import type { TravelPlanResponse } from '../llm/types';

interface CachedPrompt {
  id: string;
  prompt: string;
  response: TravelPlanResponse;
  provider: string;
  token_count: number;
  created_at: string;
}

export class PromptCache {
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static TOKEN_LIMIT = 100000; // Daily token limit

  static async get(prompt: string): Promise<TravelPlanResponse | null> {
    try {
      const { data, error } = await supabase
        .from('prompt_cache')
        .select('*')
        .eq('prompt', prompt)
        .single();

      if (error || !data) return null;

      const cached = data as CachedPrompt;
      const age = Date.now() - new Date(cached.created_at).getTime();

      if (age > this.CACHE_DURATION) {
        await this.delete(prompt);
        return null;
      }

      return cached.response;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  static async set(
    prompt: string, 
    response: TravelPlanResponse, 
    provider: string,
    tokenCount: number
  ): Promise<void> {
    try {
      // Check daily token usage
      const dailyTokens = await this.getDailyTokenUsage();
      if (dailyTokens + tokenCount > this.TOKEN_LIMIT) {
        console.warn('Daily token limit reached');
        return;
      }

      const { error } = await supabase
        .from('prompt_cache')
        .upsert([
          {
            prompt,
            response,
            provider,
            token_count: tokenCount,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error caching prompt:', error);
    }
  }

  static async delete(prompt: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('prompt_cache')
        .delete()
        .eq('prompt', prompt);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting cached prompt:', error);
    }
  }

  static async getDailyTokenUsage(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('prompt_cache')
        .select('token_count')
        .gte('created_at', today);

      if (error) {
        throw error;
      }

      return (data || []).reduce((sum, item) => sum + (item.token_count || 0), 0);
    } catch (error) {
      console.error('Error getting daily token usage:', error);
      return 0;
    }
  }

  static async cleanup(): Promise<void> {
    try {
      const expiryDate = new Date(Date.now() - this.CACHE_DURATION).toISOString();
      
      const { error } = await supabase
        .from('prompt_cache')
        .delete()
        .lt('created_at', expiryDate);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }
}