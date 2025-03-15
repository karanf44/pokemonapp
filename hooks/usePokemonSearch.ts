import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';
import { getFilteredPokemon } from '@/app/actions';

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

      const result = await getFilteredPokemon(
        searchTerm,
        selectedType,
        pageToLoad,
        ITEMS_PER_PAGE
      );

      setPokemon(prev => pageToLoad === 0 ? result.pokemon : [...prev, ...result.pokemon]);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
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