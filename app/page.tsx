'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import SearchForm from '@/components/SearchForm';
import PokemonCard from '@/components/PokemonCard';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { pokemon, loading, error, hasMore, loadMore } = usePokemonSearch(selectedType, searchTerm);
  const observer = useRef<IntersectionObserver | null>(null);

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
          onSearch={setSearchTerm}
          onTypeSelect={setSelectedType}
        />

        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}

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

        {loading && (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        )}
      </div>
    </main>
  );
}
