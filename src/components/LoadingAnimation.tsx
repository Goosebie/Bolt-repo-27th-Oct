import React, { useEffect, useState } from 'react';
import { Plane, Bus, Car, Bike, Fish, Brain } from 'lucide-react';

const loadingMessages = [
  "Don't Panic! We're planning your journey...",
  "Time is an illusion. Lunchtime doubly so...",
  "Calculating the meaning of life, the universe, and your travel plans...",
  "Share and Enjoy! (While we prepare your itinerary)",
  "So long, and thanks for all the preferences!",
  "Your travel guide is almost ready. Almost as good as bringing a towel..."
];

const transportIcons = [
  { icon: Plane, color: 'text-blue-400' },
  { icon: Bus, color: 'text-green-400' },
  { icon: Car, color: 'text-yellow-400' },
  { icon: Bike, color: 'text-red-400' },
  { icon: Fish, color: 'text-purple-400' },
  { icon: Brain, color: 'text-pink-400' }
];

export function LoadingAnimation() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % transportIcons.length);
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(iconInterval);
    };
  }, []);

  const CurrentIcon = transportIcons[iconIndex].icon;
  const currentColor = transportIcons[iconIndex].color;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <CurrentIcon className={`w-16 h-16 ${currentColor} animate-bounce`} />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent 
          blur-lg rounded-full scale-150 animate-pulse" />
      </div>
      
      <div className="space-y-4 text-center max-w-md">
        <h3 className="text-xl font-bold text-white">
          Planning Your Intergalactic Adventure
        </h3>
        <p className="text-lg text-gray-300 animate-fade-in">
          {loadingMessages[messageIndex]}
        </p>
      </div>

      <div className="flex gap-2">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" />
      </div>
    </div>
  );
}