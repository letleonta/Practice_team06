import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import type { MovieDto } from '../types/movie';

interface Props {
    movies: MovieDto[];
    title: string;
}

const MoviesLayout = ({ movies, title }: Props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('Всі');

    const uniqueGenres = useMemo(() => {
        const genres = movies.flatMap(m => m.genres || []);
        return ['Всі', ...Array.from(new Set(genres))];
    }, [movies]);

    const filteredMovies = useMemo(() => {
        return movies.filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGenre = selectedGenre === 'Всі' || m.genres?.includes(selectedGenre);
            return matchesSearch && matchesGenre;
        });
    }, [movies, searchTerm, selectedGenre]);

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-10">
            <header className="mb-10">
                <h1 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase">{title}</h1>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Пошук */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Пошук фільму..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1d26] border border-gray-800 text-white rounded-2xl pl-12 pr-4 py-3 focus:border-red-600 outline-none transition-all"
                        />
                    </div>

                    {/* Жанри */}
                    <div className="flex flex-wrap gap-2">
                        {uniqueGenres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                    selectedGenre === genre
                                        ? 'bg-red-600 border-red-600 text-white'
                                        : 'bg-[#1a1d26] border-gray-800 text-gray-400 hover:text-white'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Сітка фільмів */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredMovies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {filteredMovies.length === 0 && (
                <div className="text-center py-20 text-gray-500 font-medium text-xl">
                    Нічого не знайдено за вашим запитом
                </div>
            )}
        </div>
    );
};

export default MoviesLayout;