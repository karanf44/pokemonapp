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

// Get filtered Pokemon list with search and type filter
export async function getFilteredPokemon(
  searchTerm: string = '',
  type: string = '',
  page: number = 0,
  limit: number = 20
): Promise<{ pokemon: Pokemon[]; totalCount: number; hasMore: boolean }> {
  try {
    let pokemonList: Pokemon[] = [];
    let offset = page * limit;
    
    // If we have a type filter, fetch Pokemon by type
    if (type) {
      const typeData = await fetchWithErrorHandling<{ pokemon: { pokemon: { name: string; url: string } }[] }>(
        `${BASE_URL}/type/${type}`
      );
      
      // Extract Pokemon URLs from type data
      const pokemonUrls = typeData.pokemon.map(p => p.pokemon.url);
      
      // Apply search filter if present
      let filteredUrls = pokemonUrls;
      if (searchTerm) {
        filteredUrls = pokemonUrls.filter(url => {
          const name = url.split('/').slice(-2, -1)[0];
          return name.includes(searchTerm.toLowerCase());
        });
      }

      // Get paginated slice of URLs
      const paginatedUrls = filteredUrls.slice(offset, offset + limit);
      
      // Fetch detailed Pokemon data
      const pokemonPromises = paginatedUrls.map(url => 
        fetchWithErrorHandling<Pokemon>(url)
      );
      
      pokemonList = (await Promise.all(pokemonPromises)).filter(Boolean);
      
      return {
        pokemon: pokemonList,
        totalCount: filteredUrls.length,
        hasMore: offset + limit < filteredUrls.length
      };
    }
    
    // If we only have a search term, fetch all Pokemon and filter
    if (searchTerm) {
      // Fetch a larger list to search through
      const response = await fetchWithErrorHandling<PokemonListResponse>(
        `${BASE_URL}/pokemon?limit=100000&offset=0`
      );
      
      const filteredResults = response.results.filter(p =>
        p.name.includes(searchTerm.toLowerCase())
      );
      
      const paginatedResults = filteredResults.slice(offset, offset + limit);
      
      // Fetch detailed data for paginated results
      const pokemonPromises = paginatedResults.map(p =>
        fetchWithErrorHandling<Pokemon>(`${BASE_URL}/pokemon/${p.name}`)
      );
      
      pokemonList = (await Promise.all(pokemonPromises)).filter(Boolean);
      
      return {
        pokemon: pokemonList,
        totalCount: filteredResults.length,
        hasMore: offset + limit < filteredResults.length
      };
    }
    
    // If no filters, just fetch paginated list
    const response = await fetchWithErrorHandling<PokemonListResponse>(
      `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );
    
    const pokemonPromises = response.results.map(p =>
      fetchWithErrorHandling<Pokemon>(`${BASE_URL}/pokemon/${p.name}`)
    );
    
    pokemonList = (await Promise.all(pokemonPromises)).filter(Boolean);
    
    return {
      pokemon: pokemonList,
      totalCount: response.count,
      hasMore: !!response.next
    };
  } catch (error) {
    console.error('Error fetching filtered Pokemon:', error);
    throw new Error('Failed to fetch Pokemon');
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