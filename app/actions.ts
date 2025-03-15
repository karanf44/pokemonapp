'use server';

import { Pokemon, PokemonListResponse } from '@/types/pokemon';
import { cache } from 'react';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Helper function to handle fetch errors with timeout and retry
async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  const timeout = 5000; // 5 seconds timeout
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error instanceof Error ? error : new Error('Failed to fetch data');
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Failed to fetch after max retries');
}

// Cache the Pokemon list at the server level
export const fetchPokemonList = cache(async (limit: number = 20, offset: number = 0): Promise<PokemonListResponse> => {
  return fetchWithErrorHandling<PokemonListResponse>(
    `${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
});

// Cache individual Pokemon data
export const fetchPokemonByName = cache(async (name: string): Promise<Pokemon> => {
  return fetchWithErrorHandling<Pokemon>(
    `${API_BASE_URL}/pokemon/${name.toLowerCase()}`,
    {
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
});

// Cache Pokemon types
export const fetchPokemonTypes = cache(async (): Promise<string[]> => {
  const data = await fetchWithErrorHandling<{ results: { name: string }[] }>(
    `${API_BASE_URL}/type`,
    {
      next: { revalidate: 86400 } // Cache for 24 hours since types rarely change
    }
  );
  
  return data.results.map(type => type.name);
}); 