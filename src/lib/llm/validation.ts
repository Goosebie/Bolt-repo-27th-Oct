import type { TravelPlanResponse, TravelBudget } from './types';

export function validateTravelPlanResponse(response: any): TravelPlanResponse {
  if (!response.destination || typeof response.destination !== 'string') {
    throw new Error('Invalid or missing destination');
  }
  
  if (!response.duration || typeof response.duration !== 'string') {
    throw new Error('Invalid or missing duration');
  }
  
  // Handle both string and object budget formats
  if (!response.budget || (typeof response.budget !== 'string' && typeof response.budget !== 'object')) {
    throw new Error('Invalid or missing budget');
  }
  
  if (typeof response.budget === 'object') {
    validateBudgetObject(response.budget);
  }
  
  if (!Array.isArray(response.itinerary)) {
    throw new Error('Invalid or missing itinerary');
  }
  
  response.itinerary.forEach((day: any, index: number) => {
    if (!day.day || typeof day.day !== 'number') {
      throw new Error(`Invalid day number in itinerary at index ${index}`);
    }
    if (!Array.isArray(day.activities)) {
      throw new Error(`Invalid activities array in itinerary at day ${day.day}`);
    }
    day.activities.forEach((activity: any, actIndex: number) => {
      if (typeof activity !== 'string') {
        throw new Error(`Invalid activity at day ${day.day}, index ${actIndex}`);
      }
    });
  });
  
  if (!Array.isArray(response.recommendations)) {
    throw new Error('Invalid or missing recommendations');
  }
  
  response.recommendations.forEach((rec: any, index: number) => {
    if (typeof rec !== 'string') {
      throw new Error(`Invalid recommendation at index ${index}`);
    }
  });
  
  return response;
}

function validateBudgetObject(budget: any): asserts budget is TravelBudget {
  const requiredFields = ['transport', 'accommodations', 'activities', 'meals'];
  
  for (const field of requiredFields) {
    if (!budget[field] || typeof budget[field] !== 'string') {
      throw new Error(`Invalid or missing budget field: ${field}`);
    }
  }
}