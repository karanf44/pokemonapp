import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';
import { fetchPokemonList, fetchPokemonByName } from '@/app/actions';

const ITEMS_PER_PAGE = 20;

export function usePokemonSearch(selectedType: string, searchTerm: string) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPokemonData = useCallback(async (pageToLoad: number) => {
    try {
      if (pageToLoad === 0) {
        setInitialLoading(true);
        setPokemon([]); // Reset pokemon list when starting a new search
      } else {
        setLoading(true);
      }
      setError(null);

      // Get Pokemon list for current page
      const listResponse = await fetchPokemonList(ITEMS_PER_PAGE, pageToLoad * ITEMS_PER_PAGE);
      
      if (!listResponse?.results) {
        throw new Error('Invalid Pokemon list response');
      }

      // Update hasMore based on total count
      const total = listResponse.count || 0;
      setTotalCount(total);
      setHasMore((pageToLoad + 1) * ITEMS_PER_PAGE < total);

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
      console.error('Error fetching Pokemon:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedType, searchTerm]);

  // Reset and fetch first page when filters change
  useEffect(() => {
    setPage(0);
    fetchPokemonData(0);
  }, [selectedType, searchTerm, fetchPokemonData]);

  const loadMore = useCallback(() => {
    if (!loading && !initialLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPokemonData(nextPage);
    }
  }, [loading, initialLoading, hasMore, page, fetchPokemonData]);

  return {
    pokemon,
    loading,
    initialLoading,
    error,
    hasMore,
    loadMore,
    totalCount
  };
} 