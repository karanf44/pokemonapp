import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';
import { fetchPokemonList, fetchPokemonByName } from '@/app/actions';

const ITEMS_PER_PAGE = 20;

export function usePokemonSearch(selectedType: string, searchTerm: string) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPokemonData = useCallback(async (pageToLoad: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get Pokemon list for current page
      const listResponse = await fetchPokemonList(ITEMS_PER_PAGE, pageToLoad * ITEMS_PER_PAGE);
      
      if (!listResponse?.results) {
        throw new Error('Invalid Pokemon list response');
      }

      setHasMore(!!listResponse.next);

      // Fetch detailed data for each Pokemon in smaller chunks
      const newPokemonDetails: Pokemon[] = [];
      const chunkSize = 5;
      
      for (let i = 0; i < listResponse.results.length; i += chunkSize) {
        const chunk = listResponse.results.slice(i, i + chunkSize);
        const chunkDetails = await Promise.all(
          chunk.map(p => fetchPokemonByName(p.name))
        );
        newPokemonDetails.push(...chunkDetails);
      }

      // Filter based on type and search term
      let filtered = newPokemonDetails.filter(Boolean);

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

      setPokemon(prev => pageToLoad === 0 ? filtered : [...prev, ...filtered]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchTerm]);

  // Reset and fetch first page when filters change
  useEffect(() => {
    setPage(0);
    fetchPokemonData(0);
  }, [selectedType, searchTerm, fetchPokemonData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPokemonData(nextPage);
    }
  }, [loading, hasMore, page, fetchPokemonData]);

  return { pokemon, loading, error, hasMore, loadMore };
} 