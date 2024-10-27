import React, { useState } from 'react';
import { DollarSign, Heart, MapPin, Bus, Train, Plane, ArrowLeftRight, ArrowRight, Shuffle } from 'lucide-react';
import { DateRangePicker } from './DateRangePicker';

export interface TravelFormData {
  origin: string;
  destination?: string;
  startDate: string;
  endDate: string;
  budget: string;
  interests: string[];
  customInterests: string;
  transportMode: string[];
  tripType: 'one-way' | 'return';
}

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  loading: boolean;
}

const commonInterests = [
  'Beach', 'Mountains', 'Culture', 'Food', 'History',
  'Adventure', 'Nature', 'Shopping', 'Nightlife', 'Relaxation'
];

const transportOptions = [
  { icon: Bus, label: 'Bus' },
  { icon: Train, label: 'Train' },
  { icon: Plane, label: 'Flight' },
  { icon: Shuffle, label: 'Mixed' }
];

export function TravelForm({ onSubmit, loading }: TravelFormProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedTransport, setSelectedTransport] = useState<string[]>([]);
  const [tripType, setTripType] = useState<'one-way' | 'return'>('one-way');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleTransportToggle = (mode: string) => {
    if (mode === 'Mixed') {
      // If Mixed is selected, clear other selections
      setSelectedTransport(['Mixed']);
    } else {
      setSelectedTransport(prev => {
        // Remove 'Mixed' if it exists when selecting other modes
        const withoutMixed = prev.filter(m => m !== 'Mixed');
        
        if (prev.includes(mode)) {
          return withoutMixed.filter(m => m !== mode);
        } else {
          return [...withoutMixed, mode];
        }
      });
    }
  };

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};

    const origin = formData.get('origin') as string;
    if (!origin?.trim()) {
      errors.origin = 'Starting location is required';
    }

    if (!dates.startDate || !dates.endDate) {
      errors.dates = 'Please select travel dates';
    }

    const budget = formData.get('budget') as string;
    const budgetNum = parseFloat(budget);
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }

    if (selectedInterests.length === 0) {
      errors.interests = 'Please select at least one interest';
    }

    if (selectedTransport.length === 0) {
      errors.transport = 'Please select at least one transport mode';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!validateForm(formData)) {
      return;
    }
    
    onSubmit({
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      startDate: dates.startDate,
      endDate: dates.endDate,
      budget: formData.get('budget') as string,
      interests: selectedInterests,
      customInterests: formData.get('customInterests') as string,
      transportMode: selectedTransport,
      tripType
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Starting Location *
          </label>
          <input
            type="text"
            name="origin"
            required
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400
              backdrop-blur-sm transition-colors"
            placeholder="Enter your starting point"
          />
          {formErrors.origin && (
            <p className="mt-1 text-sm text-red-400">{formErrors.origin}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Destination (Optional)
          </label>
          <input
            type="text"
            name="destination"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400
              backdrop-blur-sm transition-colors"
            placeholder="Enter destination or let AI suggest one"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTripType('one-way')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md 
              transition-colors ${
                tripType === 'one-way'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <ArrowRight className="w-4 h-4" />
            One-way
          </button>
          <button
            type="button"
            onClick={() => setTripType('return')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md 
              transition-colors ${
                tripType === 'return'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Return
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Travel Dates *
        </label>
        <DateRangePicker
          onChange={setDates}
          className="w-full"
        />
        {formErrors.dates && (
          <p className="mt-1 text-sm text-red-400">{formErrors.dates}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Budget (USD) *
        </label>
        <input
          type="number"
          name="budget"
          required
          min="0.01"
          step="0.01"
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400
            backdrop-blur-sm transition-colors"
          placeholder="Enter your total budget"
        />
        {formErrors.budget && (
          <p className="mt-1 text-sm text-red-400">{formErrors.budget}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Travel Interests *
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonInterests.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => handleInterestToggle(interest)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedInterests.includes(interest)
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
            >
              {interest}
            </button>
          ))}
        </div>
        {formErrors.interests && (
          <p className="mt-1 text-sm text-red-400">{formErrors.interests}</p>
        )}
        <textarea
          name="customInterests"
          rows={3}
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-md 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400
            backdrop-blur-sm transition-colors"
          placeholder="Add any additional interests or preferences..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-4">
          Preferred Transport Modes *
        </label>
        <div className="flex flex-wrap gap-4">
          {transportOptions.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleTransportToggle(label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedTransport.includes(label)
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        {formErrors.transport && (
          <p className="mt-1 text-sm text-red-400">{formErrors.transport}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg
          hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 shadow-lg shadow-blue-500/30"
      >
        {loading ? 'Planning Your Dream Trip...' : 'Create Travel Plan'}
      </button>
    </form>
  );
}