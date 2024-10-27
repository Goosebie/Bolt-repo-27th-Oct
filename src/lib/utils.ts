import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function enhancePrompt(basePrompt: string, interests: string[]): string {
  const interestPrompts = {
    'history': 'Include historical sites and cultural landmarks.',
    'food': 'Recommend local cuisine and food experiences.',
    'nature': 'Include outdoor activities and natural attractions.',
    'art': 'Include museums, galleries, and artistic venues.',
    'shopping': 'Include markets and shopping districts.',
    'nightlife': 'Include evening entertainment options.',
  };

  const enhancedPrompts = interests
    .map(interest => interestPrompts[interest as keyof typeof interestPrompts])
    .filter(Boolean);

  return `
    ${basePrompt}
    
    Additional preferences:
    ${enhancedPrompts.join('\n')}
    
    Please provide:
    1. A mix of popular and off-the-beaten-path attractions
    2. Local insider tips and cultural insights
    3. Seasonal considerations and weather-appropriate activities
    4. Time-optimized route suggestions
    5. Budget-friendly alternatives where applicable
  `.trim();
}