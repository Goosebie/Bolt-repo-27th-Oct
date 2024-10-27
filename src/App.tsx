import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { TravelForm } from './components/TravelForm';
import { TravelPlan } from './components/TravelPlan';
import { TripSuggestions } from './components/TripSuggestions';
import { LoadingAnimation } from './components/LoadingAnimation';
import { useTravelPlan } from './hooks/useTravelPlan';

export function App() {
  const { generatePlan, loading, error, plans, selectedPlan, selectPlan, origin } = useTravelPlan();
  const [budget, setBudget] = useState<number>(0);

  const handleFormSubmit = (formData: any) => {
    setBudget(parseFloat(formData.budget));
    generatePlan(formData);
  };

  const handleBack = () => {
    selectPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2560')] 
        bg-cover bg-center opacity-20"
      />
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <header className="text-center mb-16 space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
              <Compass className="w-12 h-12 text-blue-400" />
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                AI Travel Planner
              </h1>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience intelligent travel planning powered by AI. Create personalized itineraries 
              tailored to your preferences, budget, and schedule.
            </p>
          </header>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-black/30 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/10
                transition-all duration-300 hover:shadow-blue-900/20">
                <TravelForm onSubmit={handleFormSubmit} loading={loading} />
                {error && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                    {error}
                  </div>
                )}
              </div>
              <div className="lg:mt-0 mt-8">
                {loading ? (
                  <LoadingAnimation />
                ) : plans.length > 0 && !selectedPlan ? (
                  <TripSuggestions 
                    suggestions={plans} 
                    onSelect={selectPlan} 
                    budget={budget}
                  />
                ) : selectedPlan ? (
                  <TravelPlan 
                    plan={selectedPlan} 
                    origin={origin} 
                    onBack={handleBack}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}