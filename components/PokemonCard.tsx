import Image from 'next/image';
import Link from 'next/link';
import { Pokemon } from '@/types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  console.log(pokemon, 'detail');
  return (
    <Link href={`/pokemon/${pokemon.id}`}>
      <div className="group relative bg-white rounded-lg shadow-lg p-4 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
        {/* Tooltip */}
        <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          Show details
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
        </div>

        <div className="relative w-full h-48">
          <Image
            src={pokemon.sprites.other['official-artwork'].front_default}
            alt={pokemon.name}
            fill
            className="object-contain transform group-hover:scale-110 transition-transform duration-300"
            priority
          />
        </div>
        <h2 className="text-xl font-bold capitalize mt-4 text-center">{pokemon.name}</h2>
        <div className="flex gap-2 justify-center mt-2">
          {pokemon.types.map((type) => (
            <span
              key={type.type.name}
              className={`${
                typeColors[type.type.name]
              } text-white px-3 py-1 rounded-full text-sm capitalize`}
            >
              {type.type.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
} 