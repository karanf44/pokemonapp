'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import PokemonCard from '@/components/PokemonCard';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const { pokemon, loading, error } = usePokemonSearch(selectedType, searchTerm);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Pokemon Search App</h1>
        
        <SearchForm
          onSearch={setSearchTerm}
          onTypeSelect={setSelectedType}
        />

        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center mt-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {pokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
