import React, { useState } from 'react';
import { LLMProviderManager } from '../lib/llm/provider-manager';
import { supabase } from '@/lib/supabase/client';

const llmManager = new LLMProviderManager();

export function TestLLM() {
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<string>('');

  const testPrompt = `
    Create a simple 2-day travel plan for:
    Starting Location: New York
    Budget: $800
    Transport Preferences: train
    Interests: food, museums
  `.trim();

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('count')
        .single();

      if (error) {
        setDbStatus(`Database Error: ${error.message}`);
        return false;
      }

      setDbStatus('Database connection successful');
      return true;
    } catch (err) {
      setDbStatus(`Database Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  const runTest = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setDbStatus('');

    try {
      // First test database connection
      const dbConnected = await testSupabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Then test LLM
      const response = await llmManager.generateTravelPlan(testPrompt);
      setResult(JSON.stringify(response, null, 2));

      // Test saving to database
      const { error: saveError } = await supabase
        .from('travel_plans')
        .insert([{
          user_id: 'test_user',
          start_location: 'New York',
          destination: response.destination,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          budget: 800,
          interests: ['food', 'museums'],
          transport_mode: ['train'],
          plan: response
        }]);

      if (saveError) {
        throw new Error(`Failed to save plan: ${saveError.message}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">System Test</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Test Configuration:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testPrompt}</pre>
        </div>

        <button
          onClick={runTest}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Run System Test'}
        </button>

        {dbStatus && (
          <div className={`p-4 rounded-md ${
            dbStatus.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            <h3 className="font-medium mb-2">Database Status:</h3>
            <pre className="whitespace-pre-wrap text-sm">{dbStatus}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <h3 className="font-medium mb-2">Error:</h3>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </div>
        )}

        {result && (
          <div className="bg-green-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}