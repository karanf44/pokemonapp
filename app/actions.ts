'use server';

import { Pokemon, PokemonListResponse } from '@/types/pokemon';
import { cache } from 'react';

const BASE_URL = 'https://pokeapi.co/api/v2';

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
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
});

// Cache individual Pokemon data
export const fetchPokemonByName = cache(async (name: string): Promise<Pokemon> => {
  return fetchWithErrorHandling<Pokemon>(
    `${BASE_URL}/pokemon/${name.toLowerCase()}`,
    {
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
});

// Cache Pokemon types
export const fetchPokemonTypes = cache(async (): Promise<string[]> => {
  const data = await fetchWithErrorHandling<{ results: { name: string }[] }>(
    `${BASE_URL}/type`,
    {
      next: { revalidate: 86400 } // Cache for 24 hours since types rarely change
    }
  );
  
  return data.results.map(type => type.name);
});

interface TypePokemon {
  pokemon: {
    name: string;
  };
}

export async function searchPokemon(searchTerm: string = '', type: string = '', page: number = 0, limit: number = 20): Promise<PokemonListResponse> {
  try {
    // Fetch all Pokemon for searching
    const allPokemon = await fetchPokemonList(limit, page * limit);
    let filteredResults = allPokemon.results;

    // If there's a search term, filter by name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter((p: { name: string }) => p.name.toLowerCase().includes(term));
    }

    // If type is specified, fetch and filter by type
    if (type) {
      const typeData = await fetchPokemonTypes();
      const pokemonOfType = new Set(typeData);
      filteredResults = filteredResults.filter((p: { name: string }) => pokemonOfType.has(p.name));
    }

    const offset = page * limit;
    
    return {
      count: filteredResults.length,
      next: offset + limit < filteredResults.length ? `${BASE_URL}/pokemon?offset=${offset + limit}&limit=${limit}` : null,
      previous: offset > 0 ? `${BASE_URL}/pokemon?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
      results: filteredResults.slice(offset, offset + limit)
    };
  } catch (error) {
    console.error('Error searching Pokemon:', error);
    throw new Error('Failed to search Pokemon');
  }
}

// export async function fetchPokemonTypes(): Promise<string[]> {
//   try {
//     const data = await fetchPokemonTypes();
//     return data;
//   } catch (error) {
//     console.error('Error fetching Pokemon types:', error);
//     return [];
//   }
// } 