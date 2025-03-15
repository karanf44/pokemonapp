'use server';

import { Pokemon, PokemonListResponse } from '@/types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon list');
  }
  return response.json();
}

export async function fetchPokemonByName(name: string): Promise<Pokemon> {
  const response = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon: ${name}`);
  }
  return response.json();
}

export async function fetchPokemonTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/type`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokemon types');
  }
  const data = await response.json();
  return data.results.map((type: { name: string }) => type.name);
} 