'use server';

import { Pokemon, PokemonListResponse } from '@/types/pokemon';
import { cache } from 'react';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Cache the Pokemon list at the server level
export const fetchPokemonList = cache(async (limit: number = 20, offset: number = 0): Promise<PokemonListResponse> => {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  return response.json();
});

// Cache individual Pokemon data
export const fetchPokemonByName = cache(async (name: string): Promise<Pokemon> => {
  const response = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon: ${name}`);
  }
  return response.json();
});

// Cache Pokemon types
export const fetchPokemonTypes = cache(async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/type`, {
    next: { revalidate: 86400 } // Cache for 24 hours since types rarely change
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon types');
  }
  const data = await response.json();
  return data.results.map((type: { name: string }) => type.name);
}); 