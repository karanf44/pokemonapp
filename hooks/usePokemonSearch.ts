import { useState, useEffect } from 'react';
import { Pokemon } from '@/types/pokemon';
import { fetchPokemonList, fetchPokemonByName } from '@/app/actions';

export function usePokemonSearch(selectedType: string, searchTerm: string) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPokemon() {
      try {
        setLoading(true);
        setError(null);
        
        // Get initial list of Pokemon
        const listResponse = await fetchPokemonList(151); // Fetch first 151 Pokemon
        
        // Fetch detailed data for each Pokemon
        const pokemonDetails = await Promise.all(
          listResponse.results.map(async (p) => {
            const details = await fetchPokemonByName(p.name);
            return details;
          })
        );

        // Filter based on type and search term
        let filtered = pokemonDetails;

        if (selectedType) {
          filtered = filtered.filter((p) =>
            p.types.some((t) => t.type.name === selectedType)
          );
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(term)
          );
        }

        setPokemon(filtered);
      } catch (err) {
        setError('Failed to fetch Pokemon');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, [selectedType, searchTerm]);

  return { pokemon, loading, error };
} 