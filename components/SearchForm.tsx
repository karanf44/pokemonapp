'use client';

import { useEffect, useState } from 'react';
import { fetchPokemonTypes } from '@/app/actions';

interface SearchFormProps {
  onSearch: (term: string) => void;
  onTypeSelect: (type: string) => void;
  disabled?: boolean;
}

export default function SearchForm({ onSearch, onTypeSelect, disabled = false }: SearchFormProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTypes() {
      try {
        const pokemonTypes = await fetchPokemonTypes();
        setTypes(pokemonTypes);
      } catch (error) {
        console.error('Failed to fetch Pokemon types:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTypes();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search Pokemon..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            onChange={(e) => onTypeSelect(e.target.value)}
            disabled={loading || disabled}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 