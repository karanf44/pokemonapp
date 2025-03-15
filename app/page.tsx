'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import PokemonCard from '@/components/PokemonCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';
import { useDebounce } from '@/hooks/useDebounce';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { 
    pokemon, 
    loading, 
    initialLoading, 
    error, 
    hasMore, 
    loadMore,
    totalCount 
  } = usePokemonSearch(selectedType, debouncedSearchTerm);
  const observer = useRef<IntersectionObserver | null>(null);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleTypeSelect = useCallback((type: string) => {
    setSelectedType(type);
  }, []);

  const lastPokemonElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore, loadMore]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Pokédex</h1>
        
        <SearchForm
          onSearch={handleSearch}
          onTypeSelect={handleTypeSelect}
          isLoading={loading || initialLoading}
        />

        {error && (
          <div className="text-red-500 text-center mt-4 p-4 bg-red-50 rounded-lg">
            <p className="font-semibold">Error loading Pokémon</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {initialLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading Pokémon...</p>
          </div>
        ) : pokemon.length === 0 ? (
          <div className="text-center mt-8 p-8 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">No Pokémon found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <div className="text-center text-gray-600 mb-4">
              Showing {pokemon.length} of {totalCount} Pokémon
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {pokemon.map((p, index) => (
                <div
                  key={p.id}
                  ref={index === pokemon.length - 1 ? lastPokemonElementRef : undefined}
                >
                  <PokemonCard pokemon={p} />
                </div>
              ))}
            </div>
          </>
        )}

        {loading && !initialLoading && (
          <div className="text-center mt-8 pb-8">
            <LoadingSpinner />
            <p className="text-gray-600 mt-2">Loading more Pokémon...</p>
          </div>
        )}

        {!loading && !hasMore && pokemon.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            No more Pokémon to load
          </div>
        )}
      </div>
    </main>
  );
}
