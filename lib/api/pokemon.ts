import { Pokemon, PokemonListResponse } from '@/types/pokemon';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  const response = await fetch(`${API_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  return response.json();
}

export async function getPokemonByName(name: string): Promise<Pokemon> {
  const response = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
  return response.json();
}

export async function getPokemonById(id: string): Promise<Pokemon> {
  const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
  return response.json();
}

export async function getPokemonTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/type`);
  const data = await response.json();
  return data.results.map((type: { name: string }) => type.name);
} 