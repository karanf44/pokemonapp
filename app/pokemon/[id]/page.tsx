import { fetchPokemonByName } from '@/app/actions';
import Image from 'next/image';
import Link from 'next/link';

export default async function PokemonDetails({
  params,
}: {
  params: { id: string };
}) {
  const pokemon = await fetchPokemonByName(params.id);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <nav className="text-gray-600 text-sm">
            <Link href="/" className="hover:text-blue-500">
              Home
            </Link>{' '}
            <span className="mx-2">/</span>{' '}
            <span className="capitalize">{pokemon.name}</span>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative h-[400px]">
              <Image
                src={
                  pokemon.sprites.other['official-artwork'].front_default ||
                  pokemon.sprites.front_default
                }
                alt={pokemon.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold capitalize mb-4">
                {pokemon.name}
              </h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Types</h2>
                  <div className="flex gap-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.type.name}
                        className="bg-gray-200 px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {type.type.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Stats</h2>
                  <div className="space-y-2">
                    {pokemon.stats.map((stat) => (
                      <div key={stat.stat.name} className="flex items-center">
                        <span className="w-32 capitalize">
                          {stat.stat.name.replace('-', ' ')}:
                        </span>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(stat.base_stat / 255) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="ml-2 w-12">{stat.base_stat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Height</h2>
                    <p>{(pokemon.height / 10).toFixed(1)} m</p>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Weight</h2>
                    <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Abilities</h2>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((ability) => (
                      <span
                        key={ability.ability.name}
                        className="bg-gray-200 px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {ability.ability.name.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 